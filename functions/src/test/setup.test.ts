import admin from 'firebase-admin';
const serviceAccount = require('../../.serviceAccountKey.json');

export const test = require('firebase-functions-test')({
  databaseURL: `https://${process.env.GCLOUD_PROJECT}-default-rtdb.firebaseio.com`,
  projectId: process.env.GCLOUD_PROJECT,
  credential: admin.credential.cert(serviceAccount),
});
admin.initializeApp();
