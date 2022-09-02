import { DateTime } from 'luxon';
const EXP_REGEXP = new RegExp(/(\d{2})(\d{2})(\d{2})\-/i);
const STATE_REGEXP = new RegExp(/(?:([A-Z]{2})(?:[CZ])(?:ALL|\d{3})[\-\>]{1}(?:ALL|\d{3}[\-\>])*)/g);

type UGCArgs = {
  /** `state` represents a territory or marine area of a US state or a Canadian province */
  state: string;
  expiration?: Date;
};

/**
 * `UGC` is a model of a the National Weather Service's Universal Geographic Code representing
 * a FIPS region
 *
 * @link https://www.nws.noaa.gov/directives/sym/pd01017002curr.pdf
 */
export class UGC {
  readonly state: string;
  expiration: Date | undefined;

  constructor(args: UGCArgs) {
    this.state = args.state;
    this.expiration = args.expiration;
  }

  /**
   * `from` validates and parses an input string into an array of UGC instances. It uses the
   * `startDate` arg plus the time encoded in the parsed expiration (format: DDHHMM) to form the `expiration`
   * info of the UGC.
   */
  static async from(inputStr: string, startDate: Date): Promise<UGC[]> {
    if (!startDate) return Promise.reject(new Error('Unable to parse UGC: start date required'));
    if (!inputStr) return Promise.reject(new Error('Unable to parse UGC: input string required'));

    const invalidReason = UGC.validateString(inputStr);
    if (invalidReason !== undefined) return Promise.reject(invalidReason);

    const ugcs: UGC[] = [];

    const [codesStr, ...expParts] = inputStr.split(EXP_REGEXP);
    const [day, hours, mins] = expParts;

    // TODO: Split state/province sections from `codesStr`

    // TODO: Split each state section into individual UGCs

    ugcs.forEach((ugc, i) => {
      if (i === 0) {
        // All expirations will be the same so only do the calculation on the first
        ugc.setExpirationDate(startDate, Number.parseInt(day), Number.parseInt(hours), Number.parseInt(mins));
        return;
      }
      if (ugcs[0].expiration) ugc.expiration = ugcs[0].expiration;
    });

    return Promise.resolve(ugcs);
  }

  /**
   * `validateString` _loosely_ validates a given UGC string.
   * If valid, it returns a resolved Promise, otherwise it returns an Error with a reason for being invalid.
   * TODO: At the moment, this only tests for the start and end of the input string. Test for multiple zones
   * within a state as well as multiple states.
   *
   * @link NWS Directive: https://www.nws.noaa.gov/directives/sym/pd01017002curr.pdf
   * @link Marine areas of responsibility: https://www.nws.noaa.gov/directives/010/archive/pd01003002m.pdf
   */
  static async validateString(inputStr: string): Promise<void> {
    const upperInputStr = inputStr?.toUpperCase();
    if (!upperInputStr) return Promise.reject(new Error('input string is required'));

    const singlecode = new RegExp(/([A-Z]{2})([CZ])(ALL|\d{3})/);

    if (!singlecode.test(upperInputStr)) return Promise.reject(new Error("invalid format 'SSFNNN'"));
    if (!EXP_REGEXP.test(upperInputStr)) return Promise.reject(new Error("invalid format 'DDHHMM'"));

    return Promise.resolve();
  }

  /**
   * `setExpirationDate` adds to the given `startDate` datetime information encoded in the UGC input string.
   * All times should assume UTC.
   * @example setExpirationDate(new Date("2022-09-01T15:00:00-00:00"), 1, 22, 15).toISOString(); // "2022-09-01T22:15:00.000Z"
   */
  setExpirationDate = (startDate: Date, day: number, hours: number, mins: number): Date => {
    let additionalDays = 0;
    if (startDate.getUTCDate() > day) {
      // E.g. `startDate` is "2022-08-31" and `day` is "01", we can infer that the expiration is tomorrow
      additionalDays = 1;
    }

    const datetime = DateTime.fromISO(startDate.toISOString())
      .setZone('utc')
      .plus({ days: additionalDays })
      .set({ hour: hours, minute: mins });

    this.expiration = new Date(datetime.toISO());
    return this.expiration;
  };
}

/**
 * `splitIntoStates` splits an `inputStr` (with the expiration date already extracted) into
 * a series of objects representing the state-specific UGC info. `state` here is abstract and may represent
 * a US state, a Canadian province, or a "Marine Area" (e.g. PZ === "Eastern North Pacific Ocean and
 * along U.S. West Coast from Canadian border to Mexican border").
 * Further processing will be needed to extract UGCs from the `stateStr` output.
 */
export function splitIntoStates(inputStr: string) {
  const output: Array<{ state: string; stateStr: string }> = [];

  const split = inputStr.matchAll(STATE_REGEXP);
  for (const regExpMatch of split) {
    const [stateStr, state] = regExpMatch;
    output.push({
      state,
      stateStr,
    });
  }

  return output;
}

export default UGC;
