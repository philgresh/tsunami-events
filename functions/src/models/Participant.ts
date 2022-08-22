import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { v4 as uuidv4 } from 'uuid';

type DBParticipant = {
  id: string;
  phone: string;
  active: boolean;
  email?: string;
};

export type ParticipantArgs = {
  phone: string;
  id?: string;
  active?: boolean;
  email?: string;
};

export default class Participant {
  id: string;
  phone: string;
  active: boolean;
  email: string;

  constructor(args: ParticipantArgs) {
    this.id = args.id ?? uuidv4();
    this.phone = args.phone;
    this.email = args.email ?? '';
    this.active = args.active ?? false;
  }

  /** `fromDB` converts a DBParticipant to an Participant instance */
  static fromDB = (dbParticipant: DBParticipant) =>
    new Participant({
      ...dbParticipant,
      email: dbParticipant?.email ?? '',
    });

  /**
   * `create` sets an Participant on the `participants` child of the DB.
   */
  create = async (): Promise<Participant> =>
    admin
      .database()
      .ref()
      .child(`participants/${this.id}`)
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

  /** `toDB` converts an Participant to a DBParticipant POJO. */
  toDB = (): DBParticipant => {
    const dbParticipant: DBParticipant = {
      id: this.id,
      phone: this.phone,
      active: this.active,
    };
    if (this.email) dbParticipant.email = this.email;
    return dbParticipant;
  };
}
