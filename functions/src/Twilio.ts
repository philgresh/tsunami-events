import * as functions from 'firebase-functions';
import * as twilio from 'twilio';
import { retryOperation } from './utils';
import type { Twilio } from 'twilio';
import type { MessageInstance, MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import type { Participant } from './models';

const TWILIO_LOG_LEVEL = process.env.TWILIO_LOG_LEVEL;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

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

  /** `smsParticipant` attempts to send an SMS message to a given Participant */
  smsParticipant = async (participant: Participant, message: string) => {
    if (!participant.active) return Promise.resolve();
    const msgOptions: MessageListInstanceCreateOptions = {
      from: TWILIO_PHONE_NUMBER,
      to: participant.phone,
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
