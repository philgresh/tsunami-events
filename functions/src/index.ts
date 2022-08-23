import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CRON_FREQUENCY } from './constants';
import * as AtomFeed from './AtomFeed';
import { Participant } from './models';
import TwilioClient from './Twilio';

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

export const smsParticipant = functions.https.onRequest(async (req, resp) => {
  const participant = await Participant.findOrCreate(String(req.query['id']) ?? '');
  const message = decodeURI(String(req.query['message'])) ?? 'Hello there. https://gresham.dev';
  return TwilioClient.smsParticipant(participant, message)
    .then((res) => {
      resp.send(res);
    })
    .catch((err) => {
      resp.status(err.status ?? 500).send(err);
    });
});
