import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CRON_FREQUENCY } from './constants';
import * as AtomFeed from './AtomFeed';

// Fetch the service account key JSON file contents
const serviceAccount = require('../.serviceAccountKey.json');

let options: admin.AppOptions = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}-default-rtdb.firebaseio.com`,
};

// Initialize the app with a service account, granting admin privileges
if (process.env.env === 'LOCAL') {
  options = functions.config().firebase;
}
admin.initializeApp(options);
functions.logger.log('App initialized');

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule(CRON_FREQUENCY).onRun((context) => {
  functions.logger.log(`scheduledFetchAndParseLatestEvents runs ${CRON_FREQUENCY}`, context);
  return AtomFeed.fetchAndParseLatestEvents();
});
