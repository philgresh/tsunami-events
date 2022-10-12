import * as functions from 'firebase-functions';
import { CAP_1_2 } from 'cap-ts';
import { Alert, Participant } from '../models';
import { AlertLevel } from '../models/Alert/types';
import Twilio from './Twilio';
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

const CANCELLATION_MESSAGE =
  'Tsunami cancellations indicate the end of the damaging tsunami threat. A cancellation is issued after an evaluation of sea level data confirms that a destructive tsunami will not impact the alerted region, or after tsunami levels have subsided to non-damaging levels.';

export default class SendAlert {
  alert: Alert;

  constructor(alert: Alert) {
    this.alert = alert;
  }

  /**
   * `getConcernedParticipants` queries for Participants who:
   * 1. are active and have verified phone numbers
   * 2. TODO: have selected alert levels at or above this level
   * 3. TODO: have signed up for specific Geos that overlap this Alert
   */
  getConcernedParticipants = async (): Promise<Participant[]> => {
    if (!this.alert) return Promise.reject(new Error('unable to get concerned participants: no alert arg given'));

    let activeParticipants: Participant[] = [];
    try {
      activeParticipants = await Participant.getAllActiveAndVerified();
    } catch (err: any) {
      const errMsg = new Error(`unable to get concerned participants: ${err?.message ?? err}`);
      functions.logger.error('SendAlert.getConcernedParticipants', { errorStack: errMsg.stack });
      return Promise.reject(errMsg);
    }
    return Promise.resolve(activeParticipants);
  };

  /**
   * `craftAlertMessages` returns a message for each `info` segment within an Alert.
   * TODO: Tighten down the messaging here. For now, blast everybody with the high-level and a link to more
   * TODO: Support multiple languages. For now, only send English messages.
   */
  craftAlertMessages = (): string[] => {
    const messages: string[] = [];
    const alertJSON = this.alert.toDB();

    alertJSON.info_list.forEach((infoSegment) => {
      const message = craftInfoSegmentMessage(infoSegment, this.alert.alertLevel, this.alert.earthquakeLocDesc);
      if (message) messages.push(message);
    });

    return messages;
  };

  /**
   * `sendAlertToParticipants` sends an Alert to participants via SMS if they have signed up for
   * updates, have verified their phone, and have selected Geos that overlap with this Alert.
   * TODO: Incorporate pubsub instead of sending messages directly.
   */
  sendAlertToParticipants = async (): Promise<void> => {
    if (!this.alert) return Promise.reject(new Error('unable to get send alert to participants: no alert arg given'));

    let participants: Participant[] = [];
    try {
      participants = await this.getConcernedParticipants();
    } catch (err: any) {
      const errMsg = new Error(`unable to send alert to participants: ${err?.message ?? err}`);
      functions.logger.error('SendAlert.sendAlertToParticipants:error', { errorStack: errMsg.stack });
      return Promise.reject(errMsg);
    }

    functions.logger.error(`SendAlert.sendAlertToParticipants: found ${participants.length} participants`);
    if (participants.length === 0) return Promise.resolve();

    const messages = this.craftAlertMessages();

    type PromisesArrayEntryType = {
      participant: Participant;
      message: string;
      promise: Promise<MessageInstance>;
    };

    const smsPromises: PromisesArrayEntryType[] = [];

    for (const participant of participants) {
      for (const message of messages) {
        if (!participant?.phone?.number) continue;
        if (!message) continue;
        smsPromises.push({
          participant,
          message,
          promise: Twilio.sendSMS(participant.phone.number, message),
        });
      }
    }

    await Promise.allSettled(smsPromises.map(({ promise }) => promise)).then((allSettledResult) => {
      allSettledResult.forEach((result, index) => {
        if (result.status === 'rejected') {
          // Twilio promise already includes retrying
          functions.logger.error(`SendAlert.sendAlertToParticipants:error: unable to deliver SMS: ${result.reason}`, {
            phone: smsPromises[index].participant.phone?.number,
            message: smsPromises[index].message,
          });
        }
      });
    });
  };
}

/**
 * `craftInfoSegmentMessage` creates a newline-separated message from an `infoSegment`, `alertLevel`,
 * and earthquake location description. Cancellation messages are treated differently.
 */
export const craftInfoSegmentMessage = (
  infoSegment: CAP_1_2.Alert_info_list_info_toJSON_type,
  alertLevel?: AlertLevel,
  earthquakeLocDesc?: string
): string => {
  const { headline, instruction, language, web } = infoSegment;
  if (language?.toLowerCase() !== 'en-us') return '';
  const websiteAnnounce = 'Tsunami.events: ';
  const fallbackHeadline = 'A possible tsunami event has occurred.';
  const topline = websiteAnnounce + (headline || fallbackHeadline);
  const earthquakeMessage = `This message concerns a ${earthquakeLocDesc}.`;

  const messageParts: string[] = [topline, earthquakeMessage];

  const isCancellation = alertLevel === AlertLevel.Cancellation;

  if (isCancellation) {
    messageParts.push(CANCELLATION_MESSAGE);
  } else if (instruction) {
    messageParts.push(instruction);
  }
  if (web) messageParts.push(`For more details, visit: ${web}`);
  return messageParts.join('\n').replace(/\s\s+/g, ' ');
};
