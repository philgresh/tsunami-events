import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CRON_FREQUENCY } from './constants';
import { Event } from './models';
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
const app = admin.initializeApp(options);
functions.logger.log('App initialized', options, app);

export const updateEvent = functions.https.onRequest(async (_, resp) => {
  const event = new Event('08a0a942-ff4d-4790-99a5-151071c2ac36');
  event.alertIDs = ['abcd-5435'];
  try {
    event.updateAlerts().then((res) => resp.send(res));
  } catch (e) {
    resp.status(500).send(e);
  }
});

export const fetchAndParseLatestEvents = functions.https.onRequest((_, resp) => {
  AtomFeed.fetchAndParseLatestEvents()
    .then((res) => {
      resp.send(res);
    })
    .catch((err) => {
      resp.status(err?.status ?? 500).send(err);
    });
});

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule(CRON_FREQUENCY).onRun((context) => {
  functions.logger.log(`scheduledFetchAndParseLatestEvents runs ${CRON_FREQUENCY}`, context);
  return AtomFeed.fetchAndParseLatestEvents();
});
