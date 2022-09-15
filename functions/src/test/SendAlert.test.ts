import { getConcernedParticipants } from '../SendAlert';
import { Alert } from '../models';
import Participant from '../models/Participant';
import Phone from '../models/Phone';
import { readXML } from './test_utils';
// jest.mock('../models/Participant.ts');

const mockParticipant = new Participant({
  id: 'active-and-verified',
  active: true,
  phone: new Phone({
    participantID: 'active-and-verified',
    number: '+14158675309',
    verificationStatus: 'approved',
  }),
});

describe('SendAlert', () => {
  let mockGetAllActiveAndVerified: jest.SpyInstance<Promise<Participant[]>, []>;

  beforeEach(() => {
    mockGetAllActiveAndVerified = jest
      .spyOn(Participant, 'getAllActiveAndVerified')
      .mockImplementation(() => Promise.resolve([mockParticipant]));
  });

  describe('getConcernedParticipants', () => {
    it('returns a rejected Promise if no Alert arg is given', async () => {
      // @ts-ignore: Argument of type 'undefined' is not assignable to parameter of type 'Alert'.ts(2345)
      expect(getConcernedParticipants(undefined)).rejects.toThrow(
        'unable to get concerned participants: no alert arg given'
      );
    });

    it('returns a Promise resolving to an array of Participants', async () => {
      const alert = await Alert.fromXML(readXML());
      let err;
      let activeParticipants: Participant[] | undefined = undefined;
      try {
        activeParticipants = await getConcernedParticipants(alert);
      } catch (e: any) {
        err = e;
      }
      expect(err).toBeUndefined();
      expect(activeParticipants).not.toBeUndefined();
      expect(activeParticipants).toHaveLength(1);
      expect(activeParticipants?.[0]).toBe(mockParticipant);
      expect(mockGetAllActiveAndVerified).toHaveBeenCalled();
    });

    it('catches errors returned by Participant methods', async () => {
      mockGetAllActiveAndVerified.mockImplementationOnce(() =>
        Promise.reject(new Error('unable to get all active participants: internal error'))
      );
      const alert = await Alert.fromXML(readXML());
      let err;
      let activeParticipants: Participant[] | undefined = undefined;
      try {
        activeParticipants = await getConcernedParticipants(alert);
      } catch (e: any) {
        err = e;
      }
      expect(err).not.toBeUndefined();
      expect(err?.message).toBe(
        'unable to get concerned participants: unable to get all active participants: internal error'
      );
      expect(activeParticipants).toBeUndefined();
    });
  });
});
