import { validate } from 'uuid';
import { Participant } from '../src/models';
import type { ParticipantArgs } from '../src/models';

describe('Participant', () => {
  const defaultArgs: ParticipantArgs = {};
  const defaultParticipant = new Participant(defaultArgs);
  const fullArgs: ParticipantArgs = {
    id: 'abcd-1234',
    phone: '415-867-5309',
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
        phone: '415-867-5309',
        email: 'phil@gresham.dev',
        displayName: 'Phil',
        active: true,
      });
      expect(fromDB.id).toBe(fullParticipant.id);
      expect(fromDB.phone).toBe(fullParticipant.phone);
      expect(fromDB.email).toBe(fullParticipant.email);
      expect(fromDB.active).toBe(fullParticipant.active);
    });
  });

  describe('toDB', () => {
    it('sets all fields from DBParticipant args', () => {
      const toDB = fullParticipant.toDB();
      expect(toDB.id).toBe(fullParticipant.id);
      expect(toDB.phone).toBe(fullParticipant.phone);
      expect(toDB.email).toBe(fullParticipant.email);
      expect(toDB.active).toBe(fullParticipant.active);
    });
  });
});
