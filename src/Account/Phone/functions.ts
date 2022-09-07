import { getFunctions, httpsCallable } from 'firebase/functions';
import type { HttpsCallable } from 'firebase/functions';
import type { DBPhone } from '../../models';

export type AttemptVerifyPhoneType = HttpsCallable<{ code: string }, DBPhone>;

export const attemptVerifyPhone = httpsCallable<{ code: string }, DBPhone>(getFunctions(), 'attemptVerifyPhone');
export const sendVerificationCode = httpsCallable<DBPhone, ''>(getFunctions(), 'sendVerificationCode');
