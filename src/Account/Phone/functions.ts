import { set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getPhoneRef } from './utils';
import type { HttpsCallable } from 'firebase/functions';
import type { Phone, DBPhone } from '../../models';

export type AttemptVerifyPhoneType = HttpsCallable<{ code: string }, DBPhone>;

export const attemptVerifyPhone = httpsCallable<{ code: string }, DBPhone>(getFunctions(), 'attemptVerifyPhone');
export const sendVerificationCode = httpsCallable<DBPhone, ''>(getFunctions(), 'sendVerificationCode');
export const setUserPhone = async (phone: Phone) => {
  const phoneRef = getPhoneRef(phone.participantID);
  return set(phoneRef, phone.toDB());
};
