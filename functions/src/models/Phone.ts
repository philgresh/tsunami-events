type VerificationStatus = 'pending' | 'approved' | 'canceled';
export type DBPhone = {
  number: string;
  verificationStatus?: VerificationStatus;
  lastVerificationAttemptTime?: string;
};

type PhoneArgs = DBPhone & {
  verificationStatus: VerificationStatus | undefined;
};

class Phone {
  readonly number: string;
  verificationStatus: VerificationStatus | undefined;
  lastVerificationAttemptTime: Date | undefined;

  constructor(args: PhoneArgs) {
    this.number = args.number;
    this.verificationStatus = args.verificationStatus;
    this.lastVerificationAttemptTime = args.lastVerificationAttemptTime
      ? new Date(args.lastVerificationAttemptTime)
      : undefined;
  }

  /** `fromDB` converts a DBPhone to an Phone instance */
  static fromDB = (dbPhone: DBPhone) =>
    new Phone({
      number: dbPhone.number,
      verificationStatus: dbPhone?.verificationStatus,
      lastVerificationAttemptTime: dbPhone?.lastVerificationAttemptTime,
    });

  /** `toDB` converts an Phone to a DBPhone POJO. */
  toDB = (): DBPhone => {
    const dbPhone: DBPhone = {
      number: this.number,
    };
    if (this.verificationStatus) dbPhone.verificationStatus = this.verificationStatus;
    if (this.lastVerificationAttemptTime)
      dbPhone.lastVerificationAttemptTime = this.lastVerificationAttemptTime.toUTCString();

    return dbPhone;
  };
}

export default Phone;
