import { CAP_1_2 } from 'cap-ts';
import SendAlert, { craftInfoSegmentMessage } from '../modules/SendAlert';
import Alert from '../models/Alert';
import Participant from '../models/Participant';
import Phone from '../models/Phone';
import { readXML } from './test_utils';
import { AlertLevel } from '../models/Alert/types';

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
  let alert: Alert;

  beforeEach(async () => {
    mockGetAllActiveAndVerified = jest
      .spyOn(Participant, 'getAllActiveAndVerified')
      .mockImplementation(() => Promise.resolve([mockParticipant]));
    alert = await Alert.fromXML(readXML());
  });

  describe('constructor', () => {
    it('constructs an instance of SendAlert', async () => {
      const sendAlert = new SendAlert(alert);
      expect(sendAlert.alert).toBe(alert);
    });
  });

  describe('getConcernedParticipants', () => {
    it('returns a rejected Promise if no Alert arg is given', async () => {
      // @ts-ignore: Argument of type 'undefined' is not assignable to parameter of type 'Alert'.ts(2345)
      expect(new SendAlert(undefined).getConcernedParticipants()).rejects.toThrow(
        'unable to get concerned participants: no alert arg given'
      );
    });

    it('returns a Promise resolving to an array of Participants', async () => {
      const sendAlert = new SendAlert(alert);

      let err;
      let activeParticipants: Participant[] | undefined = undefined;
      try {
        activeParticipants = await sendAlert.getConcernedParticipants();
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
      const sendAlert = new SendAlert(alert);

      let err;
      let activeParticipants: Participant[] | undefined = undefined;
      try {
        activeParticipants = await sendAlert.getConcernedParticipants();
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

  describe('sendAlertToParticipants', () => {
    let sendAlert: SendAlert;
    let craftAlertMessagesSpy: jest.SpyInstance<string[], []>;

    beforeEach(() => {
      sendAlert = new SendAlert(alert);
      craftAlertMessagesSpy = jest
        .spyOn(sendAlert, 'craftAlertMessages')
        .mockImplementation(() => ['message1', 'message2']);
    });

    it('catches errors returned by getConcernedParticipants', async () => {
      mockGetAllActiveAndVerified.mockImplementationOnce(() =>
        Promise.reject(new Error('unable to get all active participants: internal error'))
      );

      let err;
      try {
        await sendAlert.sendAlertToParticipants();
      } catch (e: any) {
        err = e;
      }
      expect(err).not.toBeUndefined();
      expect(err?.message).toBe(
        'unable to send alert to participants: unable to get concerned participants: unable to get all active participants: internal error'
      );
    });

    it('calls craftAlertMessages', async () => {
      let err;
      try {
        await sendAlert.sendAlertToParticipants();
      } catch (e: any) {
        err = e;
      }
      expect(err).toBeUndefined();
      expect(craftAlertMessagesSpy).toHaveBeenCalled();
    });
  });

  describe('craftAlertMessages', () => {
    it('returns an array of strings', async () => {
      const alert = await Alert.fromXML(readXML());
      const sendAlert = new SendAlert(alert);

      const messages = sendAlert.craftAlertMessages();
      expect(messages).toHaveLength(1);
      expect(messages?.[0]?.includes('\n')).toBe(true);
    });
  });
});

describe('craftInfoSegmentMessage', () => {
  let infoSegment: CAP_1_2.Alert_info_list_info_toJSON_type;

  beforeEach(async () => {
    const alert = await Alert.fromXML(readXML());
    infoSegment = alert.toDB().info_list[0];
  });

  it('returns an empty string if the language is not EN-US', () => {
    infoSegment.language = 'es-mx';
    expect(craftInfoSegmentMessage(infoSegment)).toBe('');
  });

  it('includes a headline if one exists', () => {
    expect(craftInfoSegmentMessage(infoSegment).includes('This is a Tsunami Information Statement.')).toBe(true);
  });

  it('includes a fallback headline if one does not exist', () => {
    infoSegment.headline = undefined;
    expect(craftInfoSegmentMessage(infoSegment).includes('A possible tsunami event has occurred.')).toBe(true);
  });

  it('includes instructions if they exist and the alertLevel is not Cancellation', () => {
    expect(
      craftInfoSegmentMessage(infoSegment, AlertLevel.Information).includes(
        'An earthquake has occurred; a tsunami is not expected.'
      )
    ).toBe(true);
  });

  it('includes the cancellation message if the alertLevel is Cancellation', () => {
    expect(
      craftInfoSegmentMessage(infoSegment, AlertLevel.Cancellation).includes(
        'Tsunami cancellations indicate the end of the damaging tsunami threat.'
      )
    ).toBe(true);
  });

  it('includes the earthquake location description if it exists', () => {
    expect(
      craftInfoSegmentMessage(
        infoSegment,
        AlertLevel.Information,
        'magnitude 7.6 earthquake near the Tonga Islands'
      ).includes('This message concerns an earthquake of magnitude 7.6 earthquake near the Tonga Islands')
    ).toBe(true);
  });

  it('removes redundant spaces within instructions', () => {
    expect(craftInfoSegmentMessage(infoSegment).includes('  ')).toBe(false);
  });

  it('does not include instructions if none exists', () => {
    infoSegment.instruction = undefined;
    expect(
      craftInfoSegmentMessage(infoSegment).includes('An earthquake has occurred; a tsunami is not expected.')
    ).toBe(false);
  });

  it('includes a link to the text bulletin if it exists', () => {
    expect(
      craftInfoSegmentMessage(infoSegment).includes(
        'For more details, visit: http://ntwc.arh.noaa.gov/events/PAAQ/2022/06/04/rcz9ap/1/WEAK53/WEAK53.txt'
      )
    ).toBe(true);
  });

  it('does not include a link to the text bulletin if it does not exist', () => {
    infoSegment.web = undefined;
    expect(craftInfoSegmentMessage(infoSegment).includes('For more details')).toBe(false);
  });
});
