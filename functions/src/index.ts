import * as _ from 'lodash';
import * as functions from 'firebase-functions';
import './firebase'; // Keep near top, initializes Firebase app
import { CRON_FREQUENCY, NTWC_TSUNAMI_FEED_URL } from './constants';
import * as AtomFeed from './AtomFeed';
import { Alert, Participant, Phone } from './models';
import Twilio from './Twilio';
import { fetchXMLDocument } from './utils';
import type { ParticipantArgs, VerificationStatus } from './models';
import type { SendCodeAttempt, VerificationInstance, VerificationCheckInstance } from './Twilio';
import { DBPhone, getVerificationStatus } from './models/Phone';

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule(CRON_FREQUENCY).onRun((context) => {
  functions.logger.log(`scheduledFetchAndParseLatestEvents runs ${CRON_FREQUENCY}`, context);
  return AtomFeed.fetchAndParseEvent(NTWC_TSUNAMI_FEED_URL, 'NTWC Tsunami Atom Feed');
});

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
 * `manuallyAddAlert` allows admin to manually add Alerts from a URL.
 * Usage: POST /manuallyAddAlert
 * @body `{ "alertURLs": string[] }`
 * @returns `
 * {
 *    successfulAlerts: {
 *      alertID: string;
 *      alertURL: string;
 *    }[],
 *    unsuccessfulAlerts: {
 *       alertURL: string;
 *       reason: string;
 *    }[]
 * }
 * `
 */
export const manuallyAddAlert = functions.https.onRequest(async (req, res) => {
  if (!req?.body?.['alertURLs']?.length) {
    res.status(400).send('A request body is required');
    return Promise.reject();
  }

  const alertURLs: string[] = req.body.alertURLs;

  functions.logger.log('Received alert URLs', alertURLs);

  const alertPromises: Promise<Alert>[] = [];

  for (const alertURL of alertURLs) {
    try {
      // Validate each alertURL before trying to use it
      const url = new URL(alertURL);
      const alertXML = await fetchXMLDocument(url.toString());
      const alert = await Alert.parseFromXML(alertXML, undefined, url.toString());
      alertPromises.push(alert.create());
    } catch (e: any) {
      const errMessage = `Unable to manually add alert '${alertURL}': ${e?.message ?? e}`;
      alertPromises.push(Promise.reject(errMessage));
    }
  }

  return Promise.allSettled(alertPromises)
    .then((results) => {
      const successfulAlerts: {
        alertID: string;
        alertURL: string;
      }[] = [];
      const unsuccessfulAlerts: {
        alertURL: string;
        reason: string;
      }[] = [];
      results.forEach((result, i) => {
        const alertURL = alertURLs[i];
        if (result.status === 'fulfilled') {
          successfulAlerts.push({
            alertURL,
            alertID: result.value.identifier,
          });
        } else {
          unsuccessfulAlerts.push({ alertURL, reason: `${result.reason}` });
        }
      });

      const resp = { successfulAlerts, unsuccessfulAlerts };

      functions.logger.log('Manually added alerts', resp);
      res.status(200).send(resp);
    })
    .catch((err) => {
      const errMsg = `Error manually adding alerts: ${err}`;
      functions.logger.error(errMsg);
      res.status(500).send(errMsg);
    });
});

export const sendVerificationCodeOnPhoneCreate = functions.database
  .ref('/participants/{id}/phone')
  .onCreate(async (snapshot, context): Promise<DBPhone> => {
    // Note: we assume existence since the Phone was just created
    const phone = Phone.fromDB(snapshot.val(), context.params.id);

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

    const lastVerificationAttempt = _.last<SendCodeAttempt>(verification.sendCodeAttempts as SendCodeAttempt[]);
    if (lastVerificationAttempt?.time) phone.lastVerificationAttemptTime = new Date(lastVerificationAttempt.time);

    phone.verificationStatus = getVerificationStatus(verification.status as VerificationStatus);
    return phone
      .update()
      .then((updatedPhone) => updatedPhone.toDB())
      .catch((err) => handleError(new Error(err)));
  });

export const attemptVerifyPhone = functions.https.onCall(async (data: { code: string }, context): Promise<DBPhone> => {
  const handleError = async (err: Error) => {
    const errMsg = `unable to verify phone: ${err}`;
    functions.logger.error(errMsg);
    return Promise.reject(new Error(errMsg));
  };

  if (!context.auth?.uid) return handleError(new Error('must be signed in'));
  if (!data.code) return handleError(new Error("must include a 'code' argument in the body"));
  if (!Number.parseInt(data.code, 10)) return handleError(new Error("'code' argument must be a valid number"));

  const participant = await Participant.find(context.auth.uid);
  if (!participant.phone) return handleError(new Error('must have a phone on record to verify it'));
  const phone = participant.phone;

  let verificationCheck: VerificationCheckInstance;
  try {
    verificationCheck = await Twilio.verifyPhone(phone.number, data.code);
  } catch (err: any) {
    return handleError(new Error(err));
  }

  phone.verificationStatus = getVerificationStatus(verificationCheck.status as VerificationStatus);
  phone.lastVerificationAttemptTime = verificationCheck.dateUpdated;

  return phone
    .update()
    .then((updatedPhone) => updatedPhone.toDB())
    .catch((err) => handleError(new Error(err)));
});
