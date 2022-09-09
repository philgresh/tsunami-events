import Phone, { getVerificationStatus, getPhonePath } from '../Phone';
import type { PhoneArgs, DBPhone } from '../Phone';

describe('getVerificationStatus', () => {
  it('returns undefined if the "statusStr" is undefined', () => {
    expect(getVerificationStatus(undefined)).toBeUndefined();
  });

  it('returns undefined if the "statusStr" is not a valid VerificationStatus', () => {
    // @ts-ignore: Argument of type '"not-a-real-status"' is not assignable to parameter of type 'VerificationStatus | undefined'.ts(2345)
    expect(getVerificationStatus('not-a-real-status')).toBeUndefined();
  });

  it('returns the "statusStr" if it is a valid VerificationStatus', () => {
    const status = getVerificationStatus('approved');
    expect(status).toBe('approved');
  });
});

describe('getPhonePath', () => {
  it('returns an empty string if no "participantID" arg is given', () => {
    expect(getPhonePath('')).toBe('');
  });

  it('concatenates the given "participantID" arg', () => {
    expect(getPhonePath('abcd-1234')).toBe('participants/abcd-1234/phone');
  });
});

describe('Phone', () => {
  const defaultArgs: PhoneArgs = {
    participantID: 'abcd-1234',
    number: '+14158675309',
  };
  describe('constructor', () => {
    it('sets all required args', () => {
      expect(new Phone(defaultArgs)).toMatchObject({
        participantID: 'abcd-1234',
        number: '+14158675309',
      });
    });

    it('sets optional args', () => {
      const optionalArgs: Partial<PhoneArgs> = {
        verificationStatus: 'pending',
        lastVerificationAttemptTime: '2022-09-08T00:00:00.000Z',
      };
      expect(
        new Phone({
          ...defaultArgs,
          ...optionalArgs,
        })
      ).toMatchObject({
        participantID: 'abcd-1234',
        number: '+14158675309',
        verificationStatus: 'pending',
        lastVerificationAttemptTime: new Date('2022-09-08T00:00:00.000Z'),
      });
    });
  });

  describe('fromDB static method', () => {
    const participantID = 'abcd-1234';
    const number = '+14158675309';
    const defaultArgs: DBPhone = {
      number,
    };

    it('creates a Phone instance with the given required args', () => {
      expect(Phone.fromDB(defaultArgs, participantID)).toMatchObject({
        participantID,
        number,
      });
    });

    it('creates a Phone instance with optional args', () => {
      const optionalArgs: Partial<DBPhone> = {
        verificationStatus: 'pending',
        lastVerificationAttemptTime: '2022-09-08T00:00:00.000Z',
      };
      expect(Phone.fromDB({ ...defaultArgs, ...optionalArgs }, participantID)).toMatchObject({
        participantID,
        number,
        verificationStatus: 'pending',
        lastVerificationAttemptTime: new Date('2022-09-08T00:00:00.000Z'),
      });
    });
  });

  describe('toDB instance method', () => {
    let phone = new Phone({ ...defaultArgs });
    beforeEach(() => {
      phone = new Phone({ ...defaultArgs });
    });

    it('returns a DBPhone instance with the given required args', () => {
      expect(phone.toDB()).toStrictEqual({
        number: '+14158675309',
      });
    });

    it('returns a DBPhone instance with optional args', () => {
      const optionalArgs: Partial<DBPhone> = {
        verificationStatus: 'pending',
        lastVerificationAttemptTime: '2022-09-08T00:00:00.000Z',
      };
      phone = new Phone({ ...defaultArgs, ...optionalArgs });

      expect(phone.toDB()).toStrictEqual({
        number: '+14158675309',
        verificationStatus: 'pending',
        lastVerificationAttemptTime: '2022-09-08T00:00:00.000Z',
      });
    });
  });
});
