import last from 'lodash/last';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Role } from '../constants';
import { Alert, DBAlert, Participant, Phone } from '../models';
import { DBPhone, VerificationStatus, getVerificationStatus } from '../models/Phone';
import SendAlert from './SendAlert';
import Twilio from './Twilio';
import type { ParticipantArgs } from '../models/Participant';
import type { SendCodeAttempt, VerificationInstance } from './Twilio';

const AUTHORS_EMAILS = new Set(String(process.env.AUTHORS_EMAILS).split(','));

/**
 * `createParticipantOnRegisterUser` creates a Participant upon a new user registering.
 */
export const createParticipantOnRegisterUser = functions.auth.user().onCreate(async (user) => {
  if (!user) return;
  const { email, displayName, uid } = user;
  const participantArgs: ParticipantArgs = {
    id: uid,
    displayName,
    email,
  };

  // Add `admin` role to authors
  if (email && AUTHORS_EMAILS.has(email)) {
    try {
      await admin.auth().setCustomUserClaims(uid, { role: Role.Admin });
      functions.logger.log('Successfully applied admin role to user', { user });
    } catch (e: any) {
      functions.logger.error('Failed to apply admin role to user', { error: e, user });
    }
  }

  return Participant.findOrCreate(participantArgs)
    .then((part) => {
      functions.logger.log('Successfully created Participant from new registered user', part.toDB());
    })
    .catch((err) => {
      functions.logger.error('Failed to create Participant from new registered user', err);
    });
});

/**
 * `sendVerificationCodeOnPhoneCreate` sends a verification code to a given phone number
 * once that phone number has been created by a user.
 */
export const sendVerificationCodeOnPhoneCreate = functions.database
  .ref('/participants/{id}/phone')
  .onCreate(async (snapshot, context): Promise<DBPhone> => {
    const participantID = context.params.id;
    const val = snapshot.val();
    if (!val?.phone?.number) return Promise.reject('No phone or phone number');
    const phone = Phone.fromDB(val, participantID);

    const handleError = async (err: Error) => {
      const errMsg = `unable to send verification code to phone '${phone.number}' ${err}`;
      functions.logger.error(errMsg);
      return Promise.reject(new Error(errMsg));
    };

    let verification: VerificationInstance;
    try {
      verification = await Twilio.sendVerificationCode(phone.number);
    } catch (err: any) {
      return handleError(new Error(err));
    }

    const lastVerificationAttempt = last<SendCodeAttempt>(verification.sendCodeAttempts as SendCodeAttempt[]);
    if (lastVerificationAttempt?.time) phone.lastVerificationAttemptTime = new Date(lastVerificationAttempt.time);

    phone.verificationStatus = getVerificationStatus(verification.status as VerificationStatus);
    return phone
      .update()
      .then((updatedPhone) => updatedPhone.toDB())
      .catch((err) => handleError(new Error(err)));
  });

/**
 * `sendAlertToParticipantsOnAlertCreate` sends an SMS to active and verified Participants once the
 * Alert has been created.
 */
export const sendAlertToParticipantsOnAlertCreate = functions.database
  .ref('/alerts/{identifier}')
  .onCreate(async (snapshot) => {
    if (!snapshot.val()) {
      functions.logger.error('functions.sendAlertToParticipants:error', { errorStack: 'Alert does not exist' });
      return Promise.reject('Alert does not exist.');
    }

    let alert: Alert;
    try {
      const alertJSON = snapshot.val() as DBAlert;
      alert = new Alert({ ...alertJSON, alertJSON });
    } catch (err: any) {
      functions.logger.error('functions.sendAlertToParticipants:error', { errorStack: err?.stack ?? err });
      return Promise.reject();
    }

    // Do not send an SMS for manually-added Alerts
    if (alert.manuallyAdded) return Promise.resolve();

    const sendAlert = new SendAlert(alert);
    return sendAlert.sendAlertToParticipants();
  });
