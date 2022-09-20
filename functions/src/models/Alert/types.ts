import { CAP_1_2 } from 'cap-ts';

/**
 * `AlertLevel` represents a high-level idea of the severity/impact of a tsunami event.
 * @link https://tsunami.gov/?page=message_definitions
 * @link https://tsunami.gov/images/procChartLargePacific.gif
 */
export enum AlertLevel {
  DO_NOT_USE,
  /** `Cancellation` is an information-only alert level.   */
  Cancellation,

  /** `Information` is an information-only alert level.
   * There are no threats or this is a very distant event for which hazards have not been determined.
   */
  Information,

  /** `Watch` is an intermediate alert level.
   * Potential hazards are not yet known.
   * Actions recommended include staying tuned for more info and getting prepared to act.
   */
  Watch,

  /** `Advisory` is a moderately severe alert level.
   * Potential hazards include strong currents and waves dangerous to those in or very near water.
   * Actions recommended include staying out of water, away from beaches and waterways.
   */
  Advisory,

  /** `Warning` is the most severe alert level.
   * Potential hazards include dangerous coastal flooding and powerful currents.
   * Actions recommended include moving to high ground or inland.
   */
  Warning,
}
/**
 * `DBAlert` represents the shape of an Alert on the database.
 * Note: Realtime Database does not allow `undefined` values so we strip those via the `toDB` method.
 */
export type DBAlert = {
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  code_list: string[];
  info_list: CAP_1_2.Alert_info_list_info_toJSON_type[];
  elem_list: string[];
  addresses?: string;
  alertLevel?: keyof typeof AlertLevel;
  earthquakeLocDesc?: string;
  eventID?: string;
  incidents?: string;
  manuallyAdded?: boolean;
  note?: string;
  references?: string;
  restriction?: string;
  source?: string;
  url?: string;
};

export type AlertArgs = {
  alertJSON: CAP_1_2.Alert_toJSON_type;
  alertLevel?: keyof typeof AlertLevel;
  earthquakeLocDesc?: string;
  eventID?: string;
  manuallyAdded?: boolean;
  url?: string;
};
