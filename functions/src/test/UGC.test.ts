import { UGC, splitIntoStates } from '../models/UGC';

describe('UGC', () => {
  describe('`from` static method', () => {
    const startDate = new Date('2022-08-31T15:00:00-00:00');
    it('returns a rejected Promise if no input string is provided', async () => {
      const inputStr = '';
      expect(UGC.from(inputStr, startDate)).rejects.toThrow('Unable to parse UGC: input string required');
    });

    // it('parses a single UGC instance from a string', async () => {
    //   const inputStr = 'COZALL-220000-';
    //   let ugcs: UGC[] = [];
    //   let err: Error | undefined;
    //   try {
    //     ugcs = await UGC.from(inputStr, startDate);
    //   } catch (e: any) {
    //     err = e;
    //   }

    //   expect(err).toBeUndefined();
    //   expect(ugcs).toHaveLength(1);
    //   expect(ugcs[0].state).toBe('CO');
    //   expect(ugcs[0].expiration).toBe(new Date('2022-08-31T22:00:00-00:00'));
    // });
  });

  describe('validateString', () => {
    it('returns an error if no input string is provided', async () => {
      expect(UGC.validateString('')).rejects.toThrow(new Error('input string is required'));
    });

    it('validates a UGC input string using "ALL"', async () => {
      const inputStr = 'COZALL-220000-';
      expect(UGC.validateString(inputStr)).resolves;
    });

    it('validates with multiple zones', async () => {
      const inputStr = 'MTZ017-061-220000-';
      expect(UGC.validateString(inputStr)).resolves;
    });
  });

  describe('setExpiration', () => {
    const startDate = new Date('2022-08-31T15:00:00-00:00');
    let ugc: UGC;
    let [day, hour, mins] = [31, 22, 15];

    beforeEach(() => {
      ugc = new UGC({
        state: 'CA',
      });
    });

    it('returns a Date object', () => {
      expect(ugc.setExpirationDate(startDate, day, hour, mins)).toBeInstanceOf(Date);
    });

    it('sets the expiration based on inputs', () => {
      ugc.setExpirationDate(startDate, day, hour, mins);
      expect(ugc.expiration).toEqual(new Date('2022-08-31T22:15:00Z'));
    });

    it('adds a day if the `day` arg is not the same as the `startDate` day', () => {
      day = 1; // Implying September 1st
      ugc.setExpirationDate(startDate, day, hour, mins);
      expect(ugc.expiration).toEqual(new Date('2022-09-01T22:15:00Z'));
    });
  });
});

describe('splitIntoStates', () => {
  it("returns an empty array if the `inputStr` doesn't match anything", () => {
    expect(splitIntoStates('')).toHaveLength(0);
  });

  it('splits an `inputStr` that represents a single-state, single-geographic-area', () => {
    const inputStr = 'PZZ356-';
    const states = splitIntoStates(inputStr);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      state: 'PZ',
      stateStr: 'PZZ356-',
    });
  });

  it('splits an `inputStr` that represents a single-state with ALL regions', () => {
    const inputStr = 'PZZALL-';
    const states = splitIntoStates(inputStr);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      state: 'PZ',
      stateStr: 'PZZALL-',
    });
  });

  it('splits an `inputStr` that represents a single-state with multiple regions', () => {
    const inputStr = 'CAZ043-040-';
    const states = splitIntoStates(inputStr);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      state: 'CA',
      stateStr: 'CAZ043-040-',
    });
  });

  it('splits an `inputStr` that represents multiple states with multiple regions', () => {
    const inputStr = 'PZZALL-CAZ043-040-';
    const states = splitIntoStates(inputStr);
    expect(states).toHaveLength(2);
    expect(states[0]).toMatchObject({
      state: 'PZ',
      stateStr: 'PZZALL-',
    });
    expect(states[1]).toMatchObject({
      state: 'CA',
      stateStr: 'CAZ043-040-',
    });
  });
});
