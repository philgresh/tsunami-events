import * as functions from 'firebase-functions';
import { CRON_FREQUENCY, NTWC_TSUNAMI_FEED_URL } from '../constants';
import * as AtomFeed from './AtomFeed';

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule(CRON_FREQUENCY).onRun((context) => {
  functions.logger.log(`scheduledFetchAndParseLatestEvents runs ${CRON_FREQUENCY}`, context);
  return AtomFeed.fetchAndParseEvent(NTWC_TSUNAMI_FEED_URL, 'NTWC Tsunami Atom Feed');
});
