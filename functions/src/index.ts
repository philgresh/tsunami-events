import * as functions from 'firebase-functions';
import * as CAPDocument from './CAPdocument';

export const fetchAndParseLatestEvents = functions.https.onRequest((_, resp) => {
  CAPDocument.fetchAndParseLatestEvents()
    .then((res) => {
      resp.send(res);
    })
    .catch((err) => {
      resp.send(err);
    });
});

export const scheduledFetchAndParseLatestEvents = functions.pubsub.schedule('every 1 minutes').onRun((context) => {
  console.log('This will be run every 1 minutes!', { context });
  return CAPDocument.fetchAndParseLatestEvents();
});
