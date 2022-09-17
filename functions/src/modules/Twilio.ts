import * as functions from 'firebase-functions';
import twilio from 'twilio';
import { retryOperation } from '../utils';
import type { Twilio } from 'twilio';
import type { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification';
import type { VerificationCheckInstance } from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import type { MessageInstance, MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

const TWILIO_LOG_LEVEL = process.env.TWILIO_LOG_LEVEL;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? 'not-a-real-auth-token'; // Prevent tests from failing
const TWILIO_VERIFICATION_SERVICE_SID =
  process.env.TWILIO_VERIFICATION_SERVICE_SID ?? 'VA-not-a-real-verification-service-sid';
const TWILIO_SID = process.env.TWILIO_SID ?? 'AC-not-a-real-verification-service-sid';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export type { VerificationInstance, VerificationCheckInstance };
export type SendCodeAttempt = {
  time: string;
  channel: string;
  attempt_sid: string;
};

/**
 * `TwilioClient` abstracts away actions such as sending an SMS to a Participant.
 */
export class TwilioClient {
  client: Twilio;
  constructor() {
    const options: twilio.Twilio.TwilioClientOptions = {};
    if (TWILIO_LOG_LEVEL) options.logLevel = TWILIO_LOG_LEVEL;
    if (!TWILIO_SID) functions.logger.error('Unable to initialize Twilio client: No SID');
    if (!TWILIO_AUTH_TOKEN) functions.logger.error('Unable to initialize Twilio client: No auth token');
    this.client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN, options);
  }

  /** `sendVerificationCode` sends an SMS with a verification code  */
  sendVerificationCode = async (phoneNumber: string) => {
    const handleError = async (err: Error) => {
      const errMsg = `unable to send verification code: ${err}`;
      functions.logger.error(errMsg);
      return Promise.reject(new Error(errMsg));
    };

    const SID = TWILIO_VERIFICATION_SERVICE_SID ?? '';
    if (!this.client || !SID) return handleError(new Error('Twilio SID not initialized'));
    if (!phoneNumber) return handleError(new Error('phoneNumber is required'));

    functions.logger.log(`Attempting to send verification code to phone '${phoneNumber}'`);

    return this.client.verify.v2
      .services(SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' })
      .then((verification) => {
        functions.logger.log(`Successfully sent verification code to phone`);
        return verification;
      })
      .catch((err) => handleError(new Error(err)));
  };

  /**
   * `verifyPhone` checks with Twilio on the verification of a phone number,
   * given a code generated from above `sendVerificationCode`
   */
  verifyPhone = async (phoneNumber: string, code: string) => {
    const handleError = async (err: Error) => {
      const errMsg = `unable to verify phone with phone number '${phoneNumber}': ${err}`;
      functions.logger.error(errMsg);
      return Promise.reject(new Error(errMsg));
    };

    const SID = TWILIO_VERIFICATION_SERVICE_SID ?? '';
    if (!this.client || !SID) return handleError(new Error('Twilio SID not initialized'));
    if (!phoneNumber) return handleError(new Error('phone number is required'));
    if (!code) return handleError(new Error('code is required'));

    return this.client.verify.v2
      .services(SID)
      .verificationChecks.create({ to: phoneNumber, code })
      .then((verificationCheck) => verificationCheck)
      .catch((err) => handleError(new Error(err)));
  };

  /** `sendSMS` attempts to send an SMS message to a given phone number */
  sendSMS = async (phoneNumber: string, message: string) => {
    const handleError = async (err: Error) => {
      const errMsg = `unable to send SMS message with phone number '${phoneNumber}': ${err}`;
      functions.logger.error(errMsg);
      return Promise.reject(new Error(errMsg));
    };

    if (!phoneNumber) return handleError(new Error('phone number is required'));
    if (!message) return handleError(new Error('message is required'));

    const msgOptions: MessageListInstanceCreateOptions = {
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      body: message,
    };
    const makeMsgPromise = () => this.client.messages.create(msgOptions);
    return retryOperation<MessageInstance>(makeMsgPromise, Math.random() * 1000, 3)
      .then((msgInstance) => {
        return msgInstance;
      })
      .catch((err) => handleError(new Error(err)));
  };
}

/** Singleton instance of TwilioClient */
export default new TwilioClient();
