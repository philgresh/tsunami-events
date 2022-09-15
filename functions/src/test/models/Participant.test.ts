import { validate } from 'uuid';
import { Participant, Phone } from '../../models';
import type { ParticipantArgs } from '../../models';

describe('Participant', () => {
  const defaultArgs: ParticipantArgs = {};
  const defaultParticipant = new Participant(defaultArgs);
  const fullArgs: ParticipantArgs = {
    id: 'abcd-1234',
    phone: new Phone({ number: '415-867-5309', participantID: 'abcd-1234' }),
    email: 'phil@gresham.dev',
    displayName: 'Phil',
    active: true,
  };
  const fullParticipant = new Participant(fullArgs);

  describe('constructor', () => {
    it('assigns a UUID as the ID if none is given', () => {
      expect(validate(defaultParticipant.id)).toBe(true);
    });

    it('sets defaults on optional arguments', () => {
      expect(defaultParticipant.active).toBe(false);
      expect(defaultParticipant.email).toBe('');
    });

    it('assigns all required arguments', () => {
      expect(defaultParticipant).toMatchObject(defaultArgs);
      expect(fullParticipant).toMatchObject(fullArgs);
    });
  });

  describe('fromDB', () => {
    it('sets all fields from DBParticipant args', () => {
      const fromDB = Participant.fromDB({
        id: 'abcd-1234',
        phone: { number: '415-867-5309' },
        email: 'phil@gresham.dev',
        displayName: 'Phil',
        active: true,
      });
      expect(fromDB.id).toBe(fullParticipant.id);
      expect(fromDB.email).toBe(fullParticipant.email);
      expect(fromDB.active).toBe(fullParticipant.active);
      expect(fromDB.phone).toMatchObject(fullParticipant.phone?.toDB() ?? {});
    });
  });

  describe('toDB', () => {
    it('sets all fields from DBParticipant args', () => {
      const toDB = fullParticipant.toDB();
      expect(toDB.id).toBe(fullParticipant.id);
      expect(toDB.email).toBe(fullParticipant.email);
      expect(toDB.active).toBe(fullParticipant.active);
      expect(toDB.phone).toMatchObject(fullParticipant.phone?.toDB() ?? {});
    });
  });
});
