import * as functions from 'firebase-functions';
import { CRON_FREQUENCY } from './constants';
import * as CAPDocument from './AtomFeed';

export const fetchAndParseLatestEvents = functions.https.onRequest((_, resp) => {
  CAPDocument.fetchAndParseLatestEvents()
    .then((res) => {
      resp.send(res);
    })
    .catch((err) => {
      resp.send(err);
    });
});

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule(CRON_FREQUENCY).onRun((context) => {
  functions.logger.log(`scheduledFetchAndParseLatestEvents runs ${CRON_FREQUENCY}`, context);
  return CAPDocument.fetchAndParseLatestEvents();
});
