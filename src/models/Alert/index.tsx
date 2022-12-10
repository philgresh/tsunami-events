import { CAP_1_2 } from 'cap-ts';
import { AlertLevel } from './types';
import type { DBAlert } from './types';

/**
 * `Alert` is the main model for the CAP_1_2 Alert (slightly extended). `Events` may reference multiple `Alerts`.
 */
export default class Alert {
  identifier?: string;
  sender?: string;
  sent?: string;
  status?: string;
  msgType?: string;
  scope?: string;
  code_list?: string[];
  info_list?: CAP_1_2.Alert_info_list_info_toJSON_type[];
  elem_list?: string[];
  addresses?: string;
  alertLevel?: AlertLevel;
  earthquakeLocDesc?: string;
  /** `eventID` cross-references an Event */
  eventID?: string;
  incidents?: string;
  manuallyAdded?: boolean;
  note?: string;
  references?: string;
  restriction?: string;
  source?: string;
  url?: string;

  /**
   * `fromDB` instantiates an `Alert` instance given an `AlertDB` instance.
   */
  static fromDB = (dbAlert: DBAlert): Alert => {
    const alert = new Alert();
    alert.identifier = dbAlert.identifier;
    alert.sender = dbAlert.sender;
    alert.sent = dbAlert.sent;
    alert.status = dbAlert.status;
    alert.msgType = dbAlert.msgType;
    alert.scope = dbAlert.scope;
    alert.code_list = dbAlert.code_list;
    alert.info_list = dbAlert.info_list;
    alert.elem_list = dbAlert.elem_list;
    alert.addresses = dbAlert.addresses;
    alert.references = dbAlert.references;
    alert.source = dbAlert.source;
    alert.incidents = dbAlert.incidents;
    alert.restriction = dbAlert.restriction;
    alert.note = dbAlert.note;
    alert.eventID = dbAlert.eventID;
    alert.url = dbAlert.url;
    alert.manuallyAdded = dbAlert.manuallyAdded;
    alert.earthquakeLocDesc = dbAlert.earthquakeLocDesc;
    alert.alertLevel = AlertLevel[dbAlert.alertLevel ?? 'DO_NOT_USE'];

    return alert;
  };

  /**
   * `getTitlizedAlertLevel` returns a titlized string of the instance's Alert Level,
   * or an empty string if it is `DO_NOT_USE`.
   */
  getTitlizedAlertLevel = (): string => {
    switch (this.alertLevel) {
      case AlertLevel.Warning:
        return 'Warning';
      case AlertLevel.Advisory:
        return 'Advisory';
      case AlertLevel.Watch:
        return 'Watch';
      case AlertLevel.Information:
        return 'Information';
      case AlertLevel.Cancellation:
        return 'Cancellation';
      default:
        return '';
    }
  };
}
