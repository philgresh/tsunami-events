import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CRON_FREQUENCY } from './constants';
import * as AtomFeed from './AtomFeed';

// Fetch the service account key JSON file contents

// Initialize the app with a service account, granting admin privileges
if (process.env.env === 'LOCAL') {
  admin.initializeApp(functions.config().firebase);
} else {
  const serviceAccount = require('../.serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.GCLOUD_PROJECT}-default-rtdb.firebaseio.com`,
  });
}

export const fetchAndParseLatestEvents = functions.https.onRequest((_, resp) => {
  AtomFeed.fetchAndParseLatestEvents(admin.database())
    .then((res) => {
      resp.send(res);
    })
    .catch((err) => {
      resp.send(err);
    });
});

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule(CRON_FREQUENCY).onRun((context) => {
  functions.logger.log(`scheduledFetchAndParseLatestEvents runs ${CRON_FREQUENCY}`, context);
  return AtomFeed.fetchAndParseLatestEvents(admin.database());
});
