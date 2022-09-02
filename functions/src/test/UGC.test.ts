import UGC, { splitIntoRegions } from '../models/UGC';

describe('UGC', () => {
  describe('constructor', () => {
    const state = 'CA';
    const region = '356';
    const expiration = new Date('2022-08-31T15:00:00-00:00');
    const ugc = new UGC({ state, expiration, region });

    it('sets the state', () => {
      expect(ugc.state).toBe('CA');
    });

    it('sets the state', () => {
      expect(ugc.region).toBe('356');
    });

    it('sets the expiration if given', () => {
      expect(ugc.expiration).toMatchObject(new Date('2022-08-31T15:00:00-00:00'));
    });

    it('sets the expiration as undefined if not present', () => {
      const ugc = new UGC({ state, region });
      expect(ugc.expiration).toBeUndefined();
    });
  });

  describe('`from` static method', () => {
    const startDate = new Date('2022-08-31T15:00:00-00:00');

    /** `testFromMethod` is a test-only helper that returns an object instead of a Promise */
    const testFromMethod = async (inputStr: string, undefinedStartDate?: Date) => {
      const date = undefinedStartDate === undefined ? undefined : startDate;
      let ugcs: UGC[] = [];
      let error: Error | undefined;

      try {
        // @ts-ignore; ts(2345) Argument of type 'undefined' is not assignable to parameter of type 'Date'.
        ugcs = await UGC.from(inputStr, date).then((ugcs) => ugcs);
      } catch (e: any) {
        error = e;
      }

      return { ugcs, error };
    };

    it('returns a rejected Promise if no `startDate` arg is provided', async () => {
      const inputStr = 'PZZALL-312200-';
      const { error, ugcs } = await testFromMethod(inputStr, undefined);
      expect(error).toMatchObject(new Error('Unable to parse UGC: start date required'));
      expect(ugcs).toHaveLength(0);
    });

    it('returns a rejected Promise if no `inputStr` arg is provided', async () => {
      const inputStr = '';
      const { error, ugcs } = await testFromMethod(inputStr, startDate);
      expect(error).toMatchObject(new Error('Unable to parse UGC: input string required'));
      expect(ugcs).toHaveLength(0);
    });

    it('returns a rejected Promise if the input string is not parseable', async () => {
      const inputStr = 'acbdsasdfasdf';
      const { error, ugcs } = await testFromMethod(inputStr, startDate);
      expect(error).toMatchObject(new Error("Unable to parse UGC from input string: invalid format 'DDHHMM'"));
      expect(ugcs).toHaveLength(0);
    });

    it('parses a single UGC instance from a string', async () => {
      const inputStr = 'PZZALL-312200-';
      const { error, ugcs } = await testFromMethod(inputStr, startDate);

      expect(error).toBeUndefined();
      expect(ugcs).toHaveLength(1);
      expect(ugcs[0]).toMatchObject({
        expiration: new Date('2022-08-31T22:00:00-00:00'),
        state: 'PZ',
        region: 'ALL',
      });
    });

    it('parses a multiple UGC instances from a string', async () => {
      const inputStr = 'PZZALL-CAZ043-040-312200-';
      const { error, ugcs } = await testFromMethod(inputStr, startDate);

      expect(error).toBeUndefined();
      expect(ugcs).toHaveLength(2);
      expect(ugcs[0]).toMatchObject({
        expiration: new Date('2022-08-31T22:00:00-00:00'),
        state: 'PZ',
        region: 'ALL',
      });
      expect(ugcs[1]).toMatchObject({
        expiration: new Date('2022-08-31T22:00:00-00:00'),
        state: 'CA',
        region: 'ALL',
      });
    });
  });

  describe('validateString', () => {
    it('returns an error if no input string is provided', async () => {
      expect(UGC.validateString('')).rejects.toThrow(new Error('input string is required'));
    });

    it('returns an error if the `inputStr` arg doesn\t match the expiration date ', async () => {
      const inputStr = 'PZZALL-NOT_A_REAL_DATE_FORMAT-';
      expect(UGC.validateString(inputStr)).rejects.toThrow(new Error("invalid format 'DDHHMM'"));
    });

    it('returns an error if the `inputStr` arg doesn\t match the state prefix ', async () => {
      const inputStr = 'NOT_A_VALID_PREFIX-312200-';
      expect(UGC.validateString(inputStr)).rejects.toThrow(new Error("invalid format for 'SSFNNN'"));
    });

    it('validates a UGC input string using "ALL"', async () => {
      const inputStr = 'PZZALL-312200-';
      expect(UGC.validateString(inputStr)).resolves;
    });

    it('validates with multiple zones', async () => {
      const inputStr = 'MTZ017-061-312200-';
      expect(UGC.validateString(inputStr)).resolves;
    });
  });

  describe('getExpirationDate', () => {
    const startDate = new Date('2022-08-31T15:00:00-00:00');
    let [day, hour, mins] = [31, 22, 15];

    it('returns a Date object', () => {
      expect(UGC.getExpirationDate(startDate, day, hour, mins)).toBeInstanceOf(Date);
    });

    it('adjusts the expiration based on inputs', () => {
      const expiration = UGC.getExpirationDate(startDate, day, hour, mins);
      expect(expiration).toEqual(new Date('2022-08-31T22:15:00Z'));
    });

    it('adds a day if the `day` arg is not the same as the `startDate` day', () => {
      day = 1; // Implying September 1st
      const expiration = UGC.getExpirationDate(startDate, day, hour, mins);
      expect(expiration).toEqual(new Date('2022-09-01T22:15:00Z'));
    });
  });
});

describe('splitIntoRegions', () => {
  it("returns an empty array if the `inputStr` doesn't match anything", () => {
    expect(splitIntoRegions('')).toHaveLength(0);
  });

  it('splits an `inputStr` that represents a single-state, single-geographic-area', () => {
    const inputStr = 'PZZ356-';
    const states = splitIntoRegions(inputStr);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      state: 'PZ',
      stateStr: 'PZZ356-',
    });
  });

  it('splits an `inputStr` that represents a single-state with ALL regions', () => {
    const inputStr = 'PZZALL-';
    const states = splitIntoRegions(inputStr);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      state: 'PZ',
      stateStr: 'PZZALL-',
    });
  });

  it('splits an `inputStr` that represents a single-state with multiple regions', () => {
    const inputStr = 'CAZ043-040-';
    const states = splitIntoRegions(inputStr);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({
      state: 'CA',
      stateStr: 'CAZ043-040-',
    });
  });

  it('splits an `inputStr` that represents multiple states with multiple regions', () => {
    const inputStr = 'PZZALL-CAZ043-040-';
    const states = splitIntoRegions(inputStr);
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
