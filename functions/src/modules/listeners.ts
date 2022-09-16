import last from 'lodash/last';
import * as functions from 'firebase-functions';
import SendAlert from './SendAlert';
import { Alert, Participant, Phone } from '../models';
import Twilio from './Twilio';
import type { ParticipantArgs } from '../models/Participant';
import type { SendCodeAttempt, VerificationInstance } from './Twilio';
import { DBPhone, VerificationStatus, getVerificationStatus } from '../models/Phone';

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
  return Participant.findOrCreate(participantArgs)
    .then((part) => {
      functions.logger.log('Successfully created Participant from new registered user', part.toDB());
    })
    .catch((err) => {
      functions.logger.log('Failed to creat Participant from new registered user', err);
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
      alert = new Alert(snapshot.val());
    } catch (err: any) {
      functions.logger.error('functions.sendAlertToParticipants:error', { errorStack: err?.stack ?? err });
      return Promise.reject();
    }

    const sendAlert = new SendAlert(alert);
    return sendAlert.sendAlertToParticipants();
  });
