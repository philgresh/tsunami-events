import { set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getPhoneRef } from './utils';
import type { Phone, DBPhone } from '../../models';
import type { HttpsCallable } from 'firebase/functions';

export type AttemptVerifyPhoneType = HttpsCallable<{ code: string }, DBPhone>;
export type SetUserPhoneType = (phone: Phone) => Promise<void>;

export const attemptVerifyPhone = httpsCallable<{ code: string }, DBPhone>(getFunctions(), 'attemptVerifyPhone');
export const sendVerificationCode = httpsCallable<DBPhone, ''>(getFunctions(), 'sendVerificationCode');

/**
 * `setUserPhone` sets the Phone on the Participant's profile in the DB.
 */
export const setUserPhone = async (phone: Phone) => {
  const phoneRef = getPhoneRef(phone.participantID);
  return set(phoneRef, phone.toDB());
};
