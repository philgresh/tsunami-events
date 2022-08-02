import { CAP_1_2 } from 'cap-ts';
import * as functions from 'firebase-functions';
import { handleError } from './utils';

/**
 * `handleAlert` parses the CAP Alert XML document and checks the DB for existing entries.
 */
export const handleAlert = async (alertDoc: string) => {
  try {
    const alert = CAP_1_2.Alert.fromXML(alertDoc);
    functions.logger.log(`Alert ID '${alert?.identifier ?? 'no-identifier'}' successfully parsed`);
    // TODO: Check the DB for existing alerts.
    //       If all have been handled already, return.
    //       Else, add the alert to the DB
    //       and dispatch a message to the appropriate pub-sub topic(s).
    return Promise.resolve('ok');
  } catch (err: any) {
    return handleError({
      message: `unable to parse alert XML document: ${err?.message}`,
      statusCode: 'internal',
      data: err,
    });
  }
};
