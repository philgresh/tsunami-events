import type { DBPhone } from './Phone';
const PARTICIPANTS_COLLECTION = 'participants';

/** `getParticipantPath` returns the DB path to a Participant.
 * If no `participantID` arg is given, it returns an empty string so as to throw an error.
 */
export const getParticipantPath = (participantID: string): string => {
  if (!participantID) return '';
  return `${PARTICIPANTS_COLLECTION}/${participantID}`;
};

export type DBParticipant = {
  id: string;
  active: boolean;
  phone?: DBPhone;
  email?: string;
  displayName?: string;
};
