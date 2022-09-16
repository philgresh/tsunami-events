import * as functions from 'firebase-functions';
import Participant from '../models/Participant';
import { DBPhone, getVerificationStatus } from '../models/Phone';
import Twilio from './Twilio';
import type { VerificationStatus } from '../models/Phone';
import type { VerificationCheckInstance } from '../modules/Twilio';

/**
 * `attemptVerifyPhone` accepts a 6-digit verification `code` arg and attempts to check it
 * against the code sent to the Participant's phone number via Twilio.
 */
export const attemptVerifyPhone = functions.https.onCall(async (data: { code: string }, context): Promise<DBPhone> => {
  const handleError = async (err: Error) => {
    const errMsg = `unable to verify phone: ${err}`;
    functions.logger.error(errMsg);
    return Promise.reject(new Error(errMsg));
  };

  if (!context.auth?.uid) return handleError(new Error('must be signed in'));
  if (!data.code) return handleError(new Error("must include a 'code' argument in the body"));
  if (!Number.parseInt(data.code, 10)) return handleError(new Error("'code' argument must be a valid number"));

  const participant = await Participant.find(context.auth.uid);
  if (!participant.phone) return handleError(new Error('must have a phone on record to verify it'));
  const phone = participant.phone;

  let verificationCheck: VerificationCheckInstance;
  try {
    verificationCheck = await Twilio.verifyPhone(phone.number, data.code);
  } catch (err: any) {
    return handleError(new Error(err));
  }

  phone.verificationStatus = getVerificationStatus(verificationCheck.status as VerificationStatus);
  phone.lastVerificationAttemptTime = verificationCheck.dateUpdated;

  return phone
    .update()
    .then((updatedPhone) => updatedPhone.toDB())
    .catch((err) => handleError(new Error(err)));
});
