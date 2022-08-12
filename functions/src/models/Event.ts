import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

type DBEvent = {
  id: string;
  alerts: string[];
};

export default class Event {
  id: string;
  /** `alertIDs` contains IDs of Alerts saved at the DB's highest level */
  alertIDs: string[];

  constructor(id: string, alertIDs?: string[]) {
    this.id = id;
    this.alertIDs = alertIDs ?? [];
  }

  /** `fromDB` converts a DBEvent to an Event instance */
  static fromDB = (dbEvent: DBEvent) => new Event(dbEvent.id, dbEvent.alerts);

  /**
   * `findOrCreate` returns an existing Event or creates it.
   */
  static findOrCreate = async (id: string): Promise<Event> =>
    admin
      .database()
      .ref(`events/${id}`)
      .once('value')
      .then((snapshot) => {
        if (!snapshot.exists()) return new Event(id).create();
        const existingEvent = snapshot.val() as DBEvent;
        functions.logger.log(`Successfully found Event '${id}'`);
        return Event.fromDB(existingEvent);
      })
      .catch((err) => Promise.reject(new Error(`unable to find Event '${id}': ${err}`)));

  /**
   * `create` sets an Event on the `events` child of the DB.
   */
  create = async (): Promise<Event> =>
    admin
      .database()
      .ref()
      .child(`events/${this.id}`)
      .set(this.toDB(), (err) => {
        if (err) {
          const errMsg = `Unable to add new Event with ID '${this.id}': ${err}`;
          functions.logger.error(errMsg, err);
          return Promise.reject(errMsg);
        }
        return Promise.resolve(this);
      })
      .then(() => {
        functions.logger.log(`Successfully created Event '${this.id}'`);
        return Promise.resolve(this);
      })
      .catch((err) => Promise.reject(err));

  /** `updateAlerts` updates the `alerts` array of strings on the DB to match the local version. */
  updateAlerts = async (): Promise<Event> => {
    const dbAlerts = new Set<string>();
    try {
      Event.findOrCreate(this.id)
        .then((event) => {
          event.alertIDs.forEach((alertID) => dbAlerts.add(alertID));
        })
        .catch((err) => err);
    } catch (err) {
      Promise.reject(new Error(`unable to update alerts on Event '${this.id}': ${err}`));
    }

    // Only update the DB if the local version differs
    if (this.alertIDs.every((alertID) => dbAlerts.has(alertID))) return Promise.resolve(this);

    // De-dupe local version of AlertIDs and resolve
    this.alertIDs.forEach((alertID) => dbAlerts.add(alertID));
    this.alertIDs = Array.from(dbAlerts);

    return admin
      .database()
      .ref(`events/${this.id}`)
      .set(this.toDB(), (err) => {
        if (err) return Promise.reject(new Error(`unable to update alerts on Event '${this.id}': ${err}`));
        return Promise.resolve(this);
      })
      .then(() => {
        functions.logger.log(`Successfully updated alerts on Event '${this.id}'`);
        return Promise.resolve(this);
      })
      .catch((e) => Promise.reject(e));
  };

  /** `toDB` converts an Event to a DBEvent POJO. */
  toDB = (): DBEvent => ({ id: this.id ?? 'no-id', alerts: this.alertIDs });
}
