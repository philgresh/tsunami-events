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

  /**
   * `findOrCreate` returns an existing Participant or creates it.
   */
  static findOrCreate = async (id: string): Promise<Participant> =>
    admin
      .database()
      .ref(`participants/${id}`)
      .once('value')
      .then((snapshot) => {
        if (!snapshot.exists())
          return new Participant({
            id,
            phone: String(process.env.MY_PHONE_NUMBER),
            active: true,
          }).create();
        const existingParticipant = snapshot.val() as DBParticipant;
        functions.logger.log(`Successfully found Participant '${id}'`);
        return Participant.fromDB(existingParticipant);
      })
      .catch((err) => Promise.reject(new Error(`unable to find Participant '${id}': ${err}`)));

  static getAllActive = async () => {
    const activeParticipants: Participant[] = [];
    await admin
      .database()
      .ref('participants')
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
      phone: this.phone,
      active: this.active,
    };
    if (this.email) dbParticipant.email = this.email;
    return dbParticipant;
  };
}
