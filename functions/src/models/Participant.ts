import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { v4 as uuidv4 } from 'uuid';
import Phone from './Phone';
import type { DBPhone } from './Phone';

const DB_PATH = 'participants';
/** `getParticipantPath` returns the DB path to a Participant.
 * If no `participantID` arg is given, it returns an empty string so as to throw an error.
 */
export const getParticipantPath = (participantID: string): string => {
  if (!participantID) return '';
  return `${DB_PATH}/${participantID}`;
};

type DBParticipant = {
  id: string;
  active: boolean;
  phone?: DBPhone;
  email?: string;
  displayName?: string;
};

export type ParticipantArgs = {
  id?: string;
  phone?: Phone;
  active?: boolean;
  email?: string;
  displayName?: string;
};

export default class Participant {
  id: string;
  active: boolean;
  email: string;
  displayName: string;
  phone: Phone | undefined;

  constructor(args: ParticipantArgs) {
    this.id = args.id ?? uuidv4();
    this.phone = args.phone;
    this.email = args.email ?? '';
    this.displayName = args.displayName ?? '';
    this.active = args.active ?? false;
  }

  /** `fromDB` converts a DBParticipant to an Participant instance */
  static fromDB = (dbParticipant: DBParticipant) =>
    new Participant({
      ...dbParticipant,
      phone:
        Object.values(dbParticipant?.phone ?? {})?.length > 0
          ? Phone.fromDB(dbParticipant.phone as DBPhone, dbParticipant.id)
          : undefined,
      email: dbParticipant?.email ?? '',
      displayName: dbParticipant?.displayName ?? '',
    });

  /**
   * `create` sets an Participant on the `participants` child of the DB.
   */
  create = async (): Promise<Participant> =>
    admin
      .database()
      .ref()
      .child(getParticipantPath(this.id))
      .set(this.toDB(), (err) => {
        if (err) {
          const errMsg = `Unable to add new Participant with ID '${this.id}': ${err}`;
          functions.logger.error(errMsg, err);
          return Promise.reject(errMsg);
        }
        return Promise.resolve(this);
      })
      .then(() => {
        functions.logger.log(`Successfully created Participant '${this.id}'`);
        return Promise.resolve(this);
      })
      .catch((err) => Promise.reject(err));

  /**
   * `find` attempts to find an existing Participant.
   */
  static find = async (id: string): Promise<Participant> => {
    const ref = getParticipantPath(id ?? '');
    functions.logger.log(`Attempting to find Participant with ID '${ref}'`);
    return admin
      .database()
      .ref(ref)
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) return Participant.fromDB({ ...snapshot.val(), id });
        return Promise.reject(new Error('Participant does not exist'));
      })
      .catch((err) => {
        return Promise.reject(new Error(`Unable to find Participant: ${err}`));
      });
  };

  /**
   * `findOrCreate` returns an existing Participant or creates it.
   */
  static findOrCreate = async (args: ParticipantArgs): Promise<Participant> => {
    return admin
      .database()
      .ref(getParticipantPath(args.id ?? ''))
      .once('value')
      .then((snapshot) => {
        if (!snapshot.exists()) return new Participant(args).create();
        const existingParticipant = snapshot.val() as DBParticipant;
        functions.logger.log(`Successfully found Participant '${existingParticipant.id}'`);
        return Participant.fromDB(existingParticipant);
      })
      .catch((err) => Promise.reject(new Error(`unable to find Participant '${args.id}': ${err}`)));
  };

  static getAllActive = async () => {
    const activeParticipants: Participant[] = [];
    await admin
      .database()
      .ref(DB_PATH)
      .orderByChild('active')
      .once('value')
      .then((snapshot) => {
        if (snapshot.val()?.active) activeParticipants.push(Participant.fromDB(snapshot.val()));
      });
    return Promise.resolve(activeParticipants);
  };

  /** `toDB` converts an Participant to a DBParticipant POJO. */
  toDB = (): DBParticipant => {
    const dbParticipant: DBParticipant = {
      id: this.id,
      active: this.active,
    };
    if (this.phone) dbParticipant.phone = this.phone.toDB();
    if (this.email) dbParticipant.email = this.email;
    if (this.displayName) dbParticipant.displayName = this.displayName;
    return dbParticipant;
  };
}
