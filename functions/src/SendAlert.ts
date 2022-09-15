import * as functions from 'firebase-functions';
import { CAP_1_2 } from 'cap-ts';
import { Alert, Participant } from './models';
import Twilio from './Twilio';
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

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
      const message = craftInfoSegmentMessage(infoSegment);
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

    const handleError = (err: any) => {
      const errMsg = new Error(`unable to send alert to participants: ${err?.message ?? err}`);
      functions.logger.error('SendAlert.sendAlertToParticipants:error', { errorStack: errMsg.stack });
      return Promise.reject(errMsg);
    };

    await Promise.allSettled(smsPromises.map(({ promise }) => promise))
      .then((allSettledResult) => {
        allSettledResult.forEach((result, index) => {
          if (result.status === 'rejected') {
            // Twilio promise already includes retrying
            functions.logger.error(`SendAlert.sendAlertToParticipants:error: unable to deliver SMS: ${result.reason}`, {
              phone: smsPromises[index].participant.phone?.number,
              message: smsPromises[index].message,
            });
          }
        });
      })
      .catch(handleError);
  };
}

export const craftInfoSegmentMessage = (infoSegment: CAP_1_2.Alert_info_list_info_toJSON_type): string => {
  const { headline, instruction, language, web } = infoSegment;
  if (language?.toLowerCase() !== 'en-us') return '';
  const fallbackHeadline = 'A tsunami event has occurred.';

  const messageParts: string[] = [headline || fallbackHeadline];

  if (instruction) messageParts.push(instruction.replace(/\s\s+/g, ' '));
  if (web) messageParts.push(`For more details, visit: ${web}`);
  return messageParts.join('\n');
};