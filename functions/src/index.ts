import * as functions from 'firebase-functions';
import './firebase'; // Keep near top, initializes Firebase app
import { CRON_FREQUENCY, NTWC_TSUNAMI_FEED_URL } from './constants';
import * as AtomFeed from './AtomFeed';
import { Alert, Participant } from './models';
import { fetchXMLDocument } from './utils';
import type { ParticipantArgs } from './models';

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
