import { getParticipantRef } from './Participant';

export type VerificationStatus = 'pending' | 'approved' | 'canceled';
export const getVerificationStatus = (statusStr: VerificationStatus | undefined): VerificationStatus | undefined => {
  if (!statusStr) return undefined;
  if (new Set<VerificationStatus>(['pending', 'approved', 'canceled']).has(statusStr)) return statusStr;

  return undefined;
};
export const getPhoneRef = (participantID: string) => `${getParticipantRef(participantID)}/phone`;

export type DBPhone = {
  number: string;
  verificationStatus?: VerificationStatus;
  lastVerificationAttemptTime?: string;
};

export type PhoneArgs = DBPhone & {
  participantID: string;
  verificationStatus?: VerificationStatus;
};

class Phone {
  readonly participantID: string;
  readonly number: string;
  readonly verificationStatus: VerificationStatus | undefined;
  readonly lastVerificationAttemptTime: Date | undefined;

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

export default Phone;
