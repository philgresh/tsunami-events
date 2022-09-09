import { getParticipantPath } from '../Participant';

describe('getParticipantPath', () => {
  it('returns an empty string if no "participantID" arg is given', () => {
    expect(getParticipantPath('')).toBe('');
  });

  it('concatenates the given "participantID" arg', () => {
    expect(getParticipantPath('abcd-1234')).toBe('participants/abcd-1234');
  });
});
