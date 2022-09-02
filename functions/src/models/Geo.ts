import { DateTime } from 'luxon';

export const ALL = 'ALL';
const EXP_REGEXP = new RegExp(/(\d{2})(\d{2})(\d{2})\-/i);
const STATE_REGEXP = new RegExp(/(?:([A-Z]{2})(?:[CZ])(?:ALL|\d{3})[\-\>]{1}(?:ALL|\d{3}[\-\>])*)/g);

type GeoArgs = {
  /** `state` represents a territory or marine area of a US state or a Canadian province */
  state: string;
  /** `region` represents a particular region within the `state`, or 'ALL' to cover all applicable regions */
  region: string | typeof ALL;
  expiration?: Date;
};

/**
 * `Geo` is a model of a the National Weather Service's Universal Geographic Code representing
 * a FIPS region
 *
 * @link https://www.nws.noaa.gov/directives/sym/pd01017002curr.pdf
 */
export class Geo {
  readonly state: string;
  readonly region: string | typeof ALL;
  expiration: Date | undefined;

  constructor(args: GeoArgs) {
    this.state = args.state;
    this.region = args.region;
    this.expiration = args.expiration;
  }

  /**
   * `from` validates and parses an input string into an array of Geo instances. It uses the
   * `startDate` arg plus the time encoded in the parsed expiration (format: DDHHMM) to form the `expiration`
   * info of the Geo.
   */
  static async from(inputStr: string, startDate: Date): Promise<Geo[]> {
    if (!startDate) return Promise.reject(new Error('Unable to parse Geo: start date required'));
    if (!inputStr) return Promise.reject(new Error('Unable to parse Geo: input string required'));

    try {
      await Geo.validateString(inputStr);
    } catch (e: any) {
      return Promise.reject(new Error(`Unable to parse Geo from input string: ${e?.message}`));
    }

    const geos: Geo[] = [];

    const [codesStr, ...expParts] = inputStr.split(EXP_REGEXP);
    const [day, hours, mins] = expParts.map((part) => Number.parseInt(part, 10));
    const expiration = Geo.getExpirationDate(startDate, day, hours, mins);

    for (const { state } of splitIntoRegions(codesStr)) {
      // For now, assume ALL on each listed state/province/marina area
      // TODO: Split each state section into individual Geos
      geos.push(
        new Geo({
          state,
          expiration,
          region: ALL,
        })
      );
    }

    return Promise.resolve(geos);
  }

  /**
   * `validateString` _loosely_ validates a given Geo string.
   * If valid, it returns a resolved Promise, otherwise it returns an Error with a reason for being invalid.
   * TODO: At the moment, this only tests for the start and end of the input string. Test for multiple zones
   * within a state as well as multiple states.
   *
   * @link NWS Directive: https://www.nws.noaa.gov/directives/sym/pd01017002curr.pdf
   * @link Marine areas of responsibility: https://www.nws.noaa.gov/directives/010/archive/pd01003002m.pdf
   */
  static async validateString(inputStr: string): Promise<void> {
    if (!inputStr) return Promise.reject(new Error('input string is required'));

    if (!new RegExp(EXP_REGEXP, 'i').test(inputStr)) return Promise.reject(new Error("invalid format 'DDHHMM'"));
    if (!new RegExp(STATE_REGEXP, 'i').test(inputStr)) return Promise.reject(new Error("invalid format for 'SSFNNN'"));

    return Promise.resolve();
  }

  /**
   * `getExpirationDate` adds to the given `startDate` datetime information encoded in the Geo input string.
   * All times should assume UTC.
   * @example setExpirationDate(new Date("2022-09-01T15:00:00-00:00"), 1, 22, 15).toISOString(); // "2022-09-01T22:15:00.000Z"
   */
  static getExpirationDate = (startDate: Date, day: number, hours: number, mins: number): Date => {
    let additionalDays = 0;
    if (startDate.getUTCDate() > day) {
      // E.g. `startDate` is "2022-08-31" and `day` is "01", we can infer that the expiration is tomorrow
      additionalDays = 1;
    }

    const datetime = DateTime.fromISO(startDate.toISOString())
      .setZone('utc')
      .plus({ days: additionalDays })
      .set({ hour: hours, minute: mins });

    return new Date(datetime.toISO());
  };
}

/**
 * `splitIntoRegions` splits an `inputStr` (with the expiration date already extracted) into
 * a series of objects representing the state-specific Geo info. `state` here is abstract and may represent
 * a US state, a Canadian province, or a "Marine Area" (e.g. PZ === "Eastern North Pacific Ocean and
 * along U.S. West Coast from Canadian border to Mexican border").
 * TODO: Further processing will be needed to extract Geos from the `stateStr` output.
 */
export function splitIntoRegions(inputStr: string) {
  const output: { state: string; stateStr: string }[] = [];

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

export default Geo;
