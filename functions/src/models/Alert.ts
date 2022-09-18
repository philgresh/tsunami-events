import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { isNil } from 'lodash';
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
  eventID?: string;
  incidents?: string;
  manuallyAdded?: boolean;
  note?: string;
  references?: string;
  restriction?: string;
  source?: string;
  url?: string;
};

/**
 * `getAlertLevel` returns the AlertLevel enum value of an equivalent string.
 */
const getAlertLevel = (str: string): AlertLevel => {
  if (!str?.toLowerCase()) return AlertLevel.DO_NOT_USE;

  if (str.toLowerCase().includes('warning')) return AlertLevel.Warning;
  if (str.toLowerCase().includes('advisory')) return AlertLevel.Advisory;
  if (str.toLowerCase().includes('watch')) return AlertLevel.Watch;
  if (str.toLowerCase().includes('information')) return AlertLevel.Information;
  if (str.toLowerCase().includes('cancelation')) return AlertLevel.Cancellation;
  if (str.toLowerCase().includes('cancellation')) return AlertLevel.Cancellation;

  return AlertLevel.DO_NOT_USE;
};

export type AlertArgs = {
  alertJSON: CAP_1_2.Alert_toJSON_type;
  alertLevel?: keyof typeof AlertLevel;
  eventID?: string;
  manuallyAdded?: boolean;
  url?: string;
};

/**
 * `Alert` is the main model for the CAP_1_2 Alert (slightly extended). `Events` may reference multiple `Alerts`.
 */
export default class Alert {
  /** `eventID` cross-references an Event */
  eventID?: string;
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
  references?: string;
  source?: string;
  incidents?: string;
  restriction?: string;
  note?: string;
  url?: string;
  alertLevel?: AlertLevel;
  manuallyAdded?: boolean;

  constructor(args: AlertArgs) {
    const { alertJSON, alertLevel, eventID, manuallyAdded, url } = args;
    this.identifier = alertJSON.identifier;
    this.sender = alertJSON.sender;
    this.sent = alertJSON.sent;
    this.status = alertJSON.status;
    this.msgType = alertJSON.msgType;
    this.scope = alertJSON.scope;
    this.code_list = alertJSON.code_list;
    this.info_list = alertJSON.info_list;
    this.elem_list = alertJSON.elem_list;
    this.addresses = alertJSON.addresses;
    this.references = alertJSON.references;
    this.source = alertJSON.source;
    this.incidents = alertJSON.incidents;
    this.restriction = alertJSON.restriction;
    this.note = alertJSON.note;
    this.eventID = eventID;
    this.url = url;
    this.manuallyAdded = manuallyAdded;
    if (alertLevel) {
      this.alertLevel = AlertLevel[alertLevel];
    } else {
      this.determineAlertLevel();
    }
  }

  /**
   * `fromCAPAlert` constructs an instance of Alert from an instance of CAP_1_2.Alert.
   */
  static fromCAPAlert = (capAlert: CAP_1_2.Alert, alertArgs?: Omit<AlertArgs, 'alertJSON'>): Alert =>
    new Alert({ ...alertArgs, alertJSON: capAlert.toJSON() });

  /** `fromXML` attempts to parse a CAP_Alert from a provided XML document and returns a
   * new Alert if successful.
   */
  static fromXML = async (alertDoc: string, alertArgs?: Omit<AlertArgs, 'alertJSON'>): Promise<Alert> => {
    try {
      const capAlert = CAP_1_2.Alert.fromXML(alertDoc);
      const alert = Alert.fromCAPAlert(capAlert, alertArgs);

      return Promise.resolve(alert);
    } catch (err: any) {
      return Promise.reject(new Error(`unable to parse an Alert from an XML document: ${err}`));
    }
  };

  /**
   * `exists` queries the database for the Alert's identifier. It does not attempt to determine equality.
   */
  exists = async () =>
    admin
      .database()
      .ref(`alerts/${this.identifier}`)
      .once('value')
      .then((snapshot) => snapshot.exists())
      .catch((err) => Promise.reject(new Error(`unable to determine if Alert '${this.identifier}' exists: ${err}`)));

  /**
   * `create` sets an Alert on the `alerts` child of the DB.
   */
  create = async (): Promise<Alert> => {
    const strippedValue = this.toDB();
    if (!this.identifier) {
      functions.logger.error('Unable to create Alert with empty identifier', this.toDB());
      return Promise.reject('Unable to create Alert with empty identifier');
    }
    functions.logger.log(`Creating Alert '${this.identifier}'`, strippedValue);
    return admin
      .database()
      .ref()
      .child(`alerts/${this.identifier}`)
      .set(strippedValue, (err) => {
        if (err) {
          const errMsg = `Unable to add new Alert with ID '${this.identifier}': ${err}`;
          functions.logger.error(errMsg, err);
          return Promise.reject(errMsg);
        }
        return Promise.resolve(this);
      })
      .then(() => {
        functions.logger.log(`Successfully created Alert '${this.identifier}'`);
        return this;
      })
      .catch((err) => Promise.reject(err));
  };

  /**
   * `determineAlertLevel` determines and sets the AlertLevel.
   * An Alert may have multiple Info segments, each of which may have different AlertLevels,
   * so we must iterate through each.
   * TODO: Determine the Alert Level for each Info segment, which should correspond to alert levels
   * for specific geographies. For now, treat each segment uniformly by using the most severe
   * AlertLevel in an Alert.
   *
   * @example
   * // Alert.info_list[0].event = "Tsunami Advisory"
   * await this.determineAlertLevel(); // AlertLevel.Advisory
   * @link https://tsunami.gov/images/procChartLargePacific.gif
   */
  determineAlertLevel = (): AlertLevel => {
    let highestAlertLevel = AlertLevel.DO_NOT_USE;

    this.info_list?.forEach((info, infoListIndex) => {
      let alertLevel: AlertLevel;
      alertLevel = getAlertLevel(info.event);
      if (alertLevel === AlertLevel.DO_NOT_USE)
        functions.logger.error(
          `Unable to determine alert level of event '${info.event}' on infoListIndex ${infoListIndex}`
        );
      if (alertLevel && alertLevel > highestAlertLevel) highestAlertLevel = alertLevel;
    });

    this.alertLevel = highestAlertLevel;
    return this.alertLevel;
  };

  /**
   * `toDB` returns a Plain Ol' JS Object, changing null/undefined values to empty strings.
   * Note: Could improve this by changing to a recursive function but I'll take the perf hit for now.
   * Somewhat surprised that RealtimeDB doesn't have an `ignoreUndefinedProperties` parameter like Firestore.
   */
  toDB = () => {
    const alertLevel = this.alertLevel ? AlertLevel[this.alertLevel] : '';

    const dbAlert: DBAlert = JSON.parse(
      JSON.stringify({
        identifier: this.identifier,
        sender: this.sender,
        sent: this.sent,
        status: this.status,
        msgType: this.msgType,
        scope: this.scope,
        code_list: this.code_list ?? [],
        info_list: this.info_list ?? [],
        elem_list: this.elem_list ?? [],
        addresses: this.addresses,
        references: this.references,
        source: this.source,
        incidents: this.incidents,
        restriction: this.restriction,
        note: this.note,
        eventID: this.eventID,
        url: this.url,
        alertLevel,
      }),
      (_, val) => {
        if (isNil(val)) return;
        return val;
      }
    );
    return dbAlert;
  };
}
