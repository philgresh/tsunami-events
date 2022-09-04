import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { getParticipantRef } from './Participant';

export type VerificationStatus = 'pending' | 'approved' | 'canceled';
export const getVerificationStatus = (statusStr: VerificationStatus | undefined): VerificationStatus | undefined => {
  if (!statusStr) return undefined;
  if (new Set<VerificationStatus>(['pending', 'approved', 'canceled']).has(statusStr)) return statusStr;

  return undefined;
};

export type DBPhone = {
  number: string;
  verificationStatus?: VerificationStatus;
  lastVerificationAttemptTime?: string;
};

type PhoneArgs = DBPhone & {
  participantID: string;
  verificationStatus?: VerificationStatus;
};

class Phone {
  readonly participantID: string;
  readonly number: string;
  verificationStatus: VerificationStatus | undefined;
  lastVerificationAttemptTime: Date | undefined;

  constructor(args: PhoneArgs) {
    this.participantID = args.participantID;
    this.number = args.number;
    this.verificationStatus = getVerificationStatus(args.verificationStatus);
    this.lastVerificationAttemptTime = args.lastVerificationAttemptTime
      ? new Date(args.lastVerificationAttemptTime)
      : undefined;
  }

  /** `fromDB` converts a DBPhone to an Phone instance */
  static fromDB = (dbPhone: DBPhone, participantID: string) =>
    new Phone({
      participantID,
      number: dbPhone.number,
      verificationStatus: dbPhone?.verificationStatus,
      lastVerificationAttemptTime: dbPhone?.lastVerificationAttemptTime,
    });

  /** `update` updates only the Phone child of a Participant */
  update = async (): Promise<Phone> => {
    if (!this.participantID) return Promise.reject(new Error('No ParticipantID set on Phone'));
    return admin
      .database()
      .ref(getPhoneRef(this.participantID))
      .set(this.toDB(), (err) => {
        if (err) {
          const errMsg = `Unable to update Phone with Participant ID '${this.participantID}': ${err}`;
          functions.logger.error(errMsg, err);
          return Promise.reject(errMsg);
        }
        return Promise.resolve(this);
      })
      .then(() => {
        functions.logger.log(`Successfully updated Phone with Participant ID '${this.participantID}'`, this.toDB());
        return Promise.resolve(this);
      })
      .catch((err) => Promise.reject(err));
  };

  /** `toDB` converts an Phone to a DBPhone POJO. */
  toDB = (): DBPhone => {
    const dbPhone: DBPhone = {
      number: this.number,
    };
    if (getVerificationStatus(this.verificationStatus)) dbPhone.verificationStatus = this.verificationStatus;
    if (this.lastVerificationAttemptTime)
      dbPhone.lastVerificationAttemptTime = this.lastVerificationAttemptTime.toISOString();

    return dbPhone;
  };
}

const getPhoneRef = (participantID: string) => `${getParticipantRef(participantID)}/phone`;

export default Phone;
