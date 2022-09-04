import * as _ from 'lodash';
import * as functions from 'firebase-functions';
import * as twilio from 'twilio';
import { retryOperation } from './utils';
import type { Twilio } from 'twilio';
import type { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification';
import type { VerificationCheckInstance } from 'twilio/lib/rest/verify/v2/service/verificationCheck';
import type { MessageInstance, MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

const TWILIO_LOG_LEVEL = process.env.TWILIO_LOG_LEVEL;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
const TWILIO_SID = process.env.TWILIO_SID;
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
    this.client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN, options);
  }

  /** `sendVerificationCode` sends an SMS with a verification code  */
  sendVerificationCode = async (phoneNumber: string) => {
    if (!phoneNumber) return Promise.reject(new Error('unable to send verification code: phoneNumber is required'));

    const SID = TWILIO_SERVICE_SID ?? '';
    if (!SID) return Promise.reject(new Error('unable to send verification code: Twilio SID not initialized'));
    functions.logger.log(`Attempting to send verification code to phone '${phoneNumber}'`);

    return this.client.verify.v2
      .services(SID)
      .verifications.create({ to: phoneNumber, channel: 'sms' })
      .then((verification) => {
        functions.logger.log(`Successfully sent verification code to phone`);
        return verification;
      })
      .catch((err) => {
        const errMsg = `unable to send verification code to phone number '${phoneNumber}': ${err}`;
        functions.logger.log(errMsg);
        return Promise.reject(new Error(errMsg));
      });
  };

  /**
   * `verifyPhone` checks with Twilio on the verification of a phone number,
   * given a code generated from above `sendVerificationCode`
   */
  verifyPhone = async (phoneNumber: string, code: string) => {
    if (!phoneNumber) return Promise.reject(new Error('unable to verify phone: phone number is required'));
    if (!code) return Promise.reject(new Error('unable to verify phone: code is required'));

    const SID = TWILIO_SERVICE_SID ?? '';
    if (!SID) return Promise.reject(new Error('unable to verify phone: Twilio SID not initialized'));

    return this.client.verify.v2
      .services(SID)
      .verificationChecks.create({ to: phoneNumber, code })
      .then((verificationCheck) => verificationCheck)
      .catch((err) => {
        const errMsg = `unable to verify phone with phone number '${phoneNumber}': ${err}`;
        functions.logger.log(errMsg);
        return Promise.reject(new Error(errMsg));
      });
  };

  /** `sendSMS` attempts to send an SMS message to a given phone number */
  sendSMS = async (phoneNumber: string, message: string) => {
    if (!phoneNumber) return Promise.reject(new Error('unable to send SMS message: phone number is required'));
    if (!message) return Promise.reject(new Error('unable to send SMS message: message is required'));

    const msgOptions: MessageListInstanceCreateOptions = {
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber,
      body: message,
    };
    const makeMsgPromise = () => this.client.messages.create(msgOptions);
    return retryOperation<MessageInstance>(makeMsgPromise, Math.random() * 1000, 3)
      .then((msgInstance) => {
        functions.logger.log('Successfully sent SMS', msgInstance);
        return msgInstance;
      })
      .catch((err) => {
        functions.logger.error(`Unable to send SMS: ${err}`);
      });
  };
}

/** Singleton instance of TwilioClient */
export default new TwilioClient();
