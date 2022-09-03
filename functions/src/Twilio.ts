import * as _ from 'lodash';
import * as functions from 'firebase-functions';
import * as twilio from 'twilio';
import { retryOperation } from './utils';
import type { Twilio } from 'twilio';
import type { MessageInstance, MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import type { Participant, Phone, VerificationStatus } from './models';

const TWILIO_LOG_LEVEL = process.env.TWILIO_LOG_LEVEL;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

type SendCodeAttempt = {
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
  sendVerificationCode = async (phone: Phone) => {
    if (!phone) return Promise.reject(new Error('unable to verify phone number: Participant has no phone number.'));
    return this.client.verify.v2
      .services(TWILIO_SERVICE_SID ?? '')
      .verifications.create({ to: phone.number, channel: 'sms' })
      .then((verification) => {
        const lastVerificationAttemptTime = _.last<SendCodeAttempt>(
          verification.sendCodeAttempts as SendCodeAttempt[]
        )?.time;
        if (phone && lastVerificationAttemptTime) {
          phone.lastVerificationAttemptTime = new Date(lastVerificationAttemptTime);
          phone.verificationStatus = verification.status as VerificationStatus;
        }
      });
  };

  /**
   * `verifyPhone` checks with Twilio on the verification of a phone number,
   * given a code generated from above `sendVerificationCode`
   */
  verifyPhone = async (phone: Phone, code: string) =>
    this.client.verify.v2
      .services(TWILIO_SERVICE_SID ?? '')
      .verificationChecks.create({ to: phone.number, code })
      .then((verification_check) => {
        if (verification_check.status === 'approved') {
          phone.verificationStatus = 'approved';
          phone.lastVerificationAttemptTime = verification_check.dateUpdated;
        }
        return Promise.resolve(verification_check);
      });

  /** `smsParticipant` attempts to send an SMS message to a given Participant */
  smsParticipant = async (participant: Participant, message: string) => {
    if (!participant.active) return Promise.resolve();
    const msgOptions: MessageListInstanceCreateOptions = {
      from: TWILIO_PHONE_NUMBER,
      to: participant.phone?.number ?? '',
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
