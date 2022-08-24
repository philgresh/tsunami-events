import 'dotenv/config';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { CRON_FREQUENCY } from './constants';
import * as AtomFeed from './AtomFeed';
import { Participant } from './models';
import type { ParticipantArgs } from './models';

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
