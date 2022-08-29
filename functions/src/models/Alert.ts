import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { isNil } from 'lodash';
import { CAP_1_2 } from 'cap-ts';

/**
 * `DBAlert` represents the shape of an Alert on the database.
 * Note: Realtime Database does not allow `undefined` values so we strip those via the `toDB` method.
 */
export type DBAlert = {
  eventID: string | undefined;
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  code_list: string[];
  info_list: CAP_1_2.Alert_info_list_info_toJSON_type[];
  elem_list: string[];
  addresses: string | undefined;
  references: string | undefined;
  source: string | undefined;
  incidents: string | undefined;
  restriction: string | undefined;
  note: string | undefined;
};

/**
 * `Alert` is the main model for the CAP_1_2 Alert (slightly extended). `Events` may reference multiple `Alerts`.
 */
export default class Alert {
  /** `eventID` cross-references an Event */
  eventID: string | undefined;
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  code_list: string[];
  info_list: CAP_1_2.Alert_info_list_info_toJSON_type[];
  elem_list: string[];
  addresses: string | undefined;
  references: string | undefined;
  source: string | undefined;
  incidents: string | undefined;
  restriction: string | undefined;
  note: string | undefined;

  constructor(capAlert: CAP_1_2.Alert, eventID?: string) {
    const capAlertJSON = capAlert.toJSON();
    this.identifier = capAlertJSON.identifier;
    this.sender = capAlertJSON.sender;
    this.sent = capAlertJSON.sent;
    this.status = capAlertJSON.status;
    this.msgType = capAlertJSON.msgType;
    this.scope = capAlertJSON.scope;
    this.code_list = capAlertJSON.code_list;
    this.info_list = capAlertJSON.info_list;
    this.elem_list = capAlertJSON.elem_list;
    this.addresses = capAlertJSON.addresses;
    this.references = capAlertJSON.references;
    this.source = capAlertJSON.source;
    this.incidents = capAlertJSON.incidents;
    this.restriction = capAlertJSON.restriction;
    this.note = capAlertJSON.note;
    this.eventID = eventID;
  }

  /** `parseFromXML` attempts to parse a CAP_Alert from a provided XML document and returns a
   * new Alert if successful.
   */
  static parseFromXML = async (alertDoc: string, eventID?: string): Promise<Alert> => {
    try {
      const capAlert = CAP_1_2.Alert.fromXML(alertDoc);
      const alert = new Alert(capAlert, eventID);
      functions.logger.log(`Alert successfully parsed`, alert.toDB());

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
    functions.logger.log(`Creating Alert '${this.identifier}'`, strippedValue);
    return admin
      .database()
      .ref()
      .child(`alerts/${this.identifier}`)
      .set(strippedValue, (err) => {
        if (err) {
          const errMsg = `Unable to add new Event with ID '${this.identifier}': ${err}`;
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
   * `toDB` returns a Plain Ol' JS Object, changing null/undefined values to empty strings.
   * Note: Could improve this by changing to a recursive function but I'll take the perf hit for now.
   * Somewhat surprised that RealtimeDB doesn't have an `ignoreUndefinedProperties` parameter like Firestore.
   */
  toDB = () => {
    const dbAlert: DBAlert = JSON.parse(
      JSON.stringify({
        identifier: this.identifier ?? '',
        sender: this.sender ?? '',
        sent: this.sent ?? '',
        status: this.status ?? '',
        msgType: this.msgType ?? '',
        scope: this.scope ?? '',
        code_list: this.code_list ?? [],
        info_list: this.info_list ?? [],
        elem_list: this.elem_list ?? [],
        addresses: this.addresses ?? '',
        references: this.references ?? '',
        source: this.source ?? '',
        incidents: this.incidents ?? '',
        restriction: this.restriction ?? '',
        note: this.note ?? '',
        eventID: this.eventID ?? '',
      }),
      (_, val) => {
        if (isNil(val)) return;
        return val;
      }
    );
    return dbAlert;
  };
}
