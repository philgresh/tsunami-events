import * as functions from 'firebase-functions';
import './firebase'; // Keep near top, initializes Firebase app
import { CRON_FREQUENCY, NTWC_TSUNAMI_FEED_URL } from './constants';
import * as AtomFeed from './AtomFeed';
import { Participant } from './models';
import type { ParticipantArgs } from './models';
import type { FetchAndParseEventResult } from './AtomFeed';

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

export const manuallyAddEvent = functions.https.onRequest(async (req, res) => {
  if (!req?.body?.['eventURLs']?.length) {
    res.status(400).send('A request body is required');
    return Promise.reject();
  }

  const eventURLs: string[] = req.body.eventURLs;

  functions.logger.log('Received event URLs:', eventURLs);

  const fetchAndParseEventPromises: Promise<FetchAndParseEventResult>[] = [];

  for (const eventURL of eventURLs) {
    try {
      // Validate each eventURL before trying to fetchAndParseEvent using it
      const url = new URL(eventURL);
      fetchAndParseEventPromises.push(AtomFeed.fetchAndParseEvent(url.toString(), 'manually added event'));
    } catch (e: any) {
      const errMessage = `Unable to manually add event: '${eventURL}'`;
      functions.logger.error('Unable to manually add event', { eventURL, error: `${e}` });
      res.status(400).send(errMessage);
      return Promise.reject(errMessage);
    }
  }

  return Promise.allSettled(fetchAndParseEventPromises)
    .then((results) => {
      const successfulEvents: {
        eventID: string;
        eventURL: string;
      }[] = [];
      const unsuccessfulEvents: {
        eventURL: string;
      }[] = [];
      results.forEach((result, i) => {
        const eventURL = eventURLs[i];
        if (result.status === 'fulfilled') {
          successfulEvents.push({
            eventURL,
            eventID: result.value.id,
          });
        } else {
          unsuccessfulEvents.push({ eventURL });
        }
      });

      const resp = { successfulEvents, unsuccessfulEvents };

      functions.logger.log('Manually added events', resp);
      res.status(200).send(resp);
    })
    .catch((err) => {
      const errMsg = `Error manually adding events: ${err}`;
      functions.logger.error(errMsg);
      res.status(500).send(errMsg);
    });
});
