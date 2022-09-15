import { Alert, Participant } from './models';

/**
 * `getConcernedParticipants` queries for Participants who:
 * 1. are active and have verified phone numbers
 * 2. TODO: have selected alert levels at or above this level
 * 3. TODO: have signed up for specific Geos that overlap this Alert
 */
export const getConcernedParticipants = async (alert: Alert): Promise<Participant[]> => {
  if (!alert) return Promise.reject(new Error('unable to get concerned participants: no alert arg given'));

  const activeParticipants = await Participant.getAllActiveAndVerified();
  return Promise.resolve(activeParticipants);
};
