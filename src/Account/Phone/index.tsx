import React from 'react';
import { ref, getDatabase, set } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useObjectVal } from 'react-firebase-hooks/database';
import { Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { matchIsValidTel } from 'mui-tel-input';
import parsePhoneNumber from 'libphonenumber-js';
import Loading from '../../Nav/Loading';
import { Phone } from '../../models';
import AddOrEditPhone from './AddOrEditPhone';
import VerifyPhoneDialog from './VerifyPhoneDialog';
import { DEFAULT_COUNTRY } from './constants';
import { useVerifyPhone } from './hooks';
import { getPhoneNumberDisplay } from './utils';
import type { ValOptions } from 'react-firebase-hooks/database/dist/database/helpers';
import type { DBPhone } from '../../models';

const sendVerificationCode = httpsCallable<DBPhone, ''>(getFunctions(), 'sendVerificationCode');
const getPhoneRef = (uid: string) => ref(getDatabase(), `participants/${uid}/phone`);

export type PhoneControllerProps = {
  uid: string;
};

const PhoneController = ({ uid }: PhoneControllerProps) => {
  const {
    loading: verifyPhoneLoading,
    error: verifyPhoneError,
    verifyPhoneDialogOpen,
    handleVerifyPhone,
    setVerifyPhoneDialogOpen,
    VerifyPhoneButton,
  } = useVerifyPhone();
  const [addOrEditOpen, setAddOrEditOpen] = React.useState(false);
  const [addEditPhoneNumberError, setAddEditPhoneNumberError] = React.useState<string | undefined>();
  const options: ValOptions<Phone | undefined> = {
    transform: (value) => (value ? Phone.fromDB(value, uid) : undefined),
  };
  const phoneRef = getPhoneRef(uid);
  const [phone, loading, error] = useObjectVal<Phone | undefined>(phoneRef, options);
  const theme = useTheme();

  const handleAddEditPhone = async (phoneNumber: string) => {
    if (!matchIsValidTel(phoneNumber, DEFAULT_COUNTRY)) {
      // setAddEditPhoneNumberError('Invalid phone number format');
      return;
    }

    const phone = new Phone({ number: phoneNumber.replace(/\s/g, ''), participantID: uid });

    try {
      await set(phoneRef, phone.toDB()).then(() => {});
    } catch (err: any) {
      setAddEditPhoneNumberError(err?.message ?? err);
    }
  };

  if (loading) return <Loading />;
  if (error || !uid)
    return (
      <Typography
        variant="body1"
        sx={{ color: theme.palette.warning.contrastText, backgroundColor: theme.palette.warning.main }}
      >
        {error?.message ?? 'No user signed in!'}
      </Typography>
    );

  if (phone) {
    const status = phone.verificationStatus;

    return (
      <>
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} justifyContent="flex-start" alignItems="center">
          <Typography variant="body2">{getPhoneNumberDisplay(phone.number)}</Typography>
          {status === 'approved' ? (
            <Typography variant="overline" color={theme.palette.success.main}>
              Verified
            </Typography>
          ) : (
            <VerifyPhoneButton />
          )}
        </Stack>
        <VerifyPhoneDialog
          open={verifyPhoneDialogOpen}
          onClose={() => setVerifyPhoneDialogOpen(false)}
          onSubmit={handleVerifyPhone}
        />
      </>
    );
  }

  return null;

  // return (
  //   <div>
  //     {addOrEditOpen && <AddOrEditPhone
  //       phoneNumber={phone?.number}
  //       onChange={async (val) => {
  //         await handleAddEditPhone(val);
  //       }}
  //       error={addEditPhoneNumberError}
  //     />}
  //     {phone && <div>Verification status: {phone.verificationStatus}</div>}
  //   </div>
  // );
};

export default PhoneController;
