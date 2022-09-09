import React from 'react';
import { useObjectVal } from 'react-firebase-hooks/database';
import { CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Phone } from '../../models';
import { AddPhone, ExistingPhone, VerifyPhoneDialog } from './components';
import { useVerifyPhone } from './hooks';
import { getPhoneNumberDisplay, getPhoneRef } from './utils';
import { attemptVerifyPhone, setUserPhone } from './functions';
import type { ValOptions } from 'react-firebase-hooks/database/dist/database/helpers';

export type PhoneControllerProps = {
  uid: string;
};

const PhoneController = ({ uid }: PhoneControllerProps) => {
  const {
    loading: verifyPhoneLoading,
    error: verifyPhoneError,
    isOpen: verifyPhoneDialogOpen,
    handleVerifyPhone,
    setIsOpen: setVerifyPhoneDialogOpen,
  } = useVerifyPhone(attemptVerifyPhone);
  const options: ValOptions<Phone | undefined> = {
    transform: (value) => (value ? Phone.fromDB(value, uid) : undefined),
  };
  const phoneRef = getPhoneRef(uid);
  const [phone, getPhoneLoading, getPhoneError] = useObjectVal<Phone | undefined>(phoneRef, options);
  const theme = useTheme();

  const loading = verifyPhoneLoading || getPhoneLoading;
  const error = verifyPhoneError || getPhoneError;

  if (loading) return <CircularProgress />;
  if (error || !uid)
    return (
      <Typography
        variant="body1"
        sx={{ color: theme.palette.warning.contrastText, backgroundColor: theme.palette.warning.main }}
      >
        {error?.message ?? 'No user signed in!'}
      </Typography>
    );

  if (!phone) return <AddPhone uid={uid} setUserPhone={setUserPhone} />;

  return (
    <>
      <ExistingPhone
        status={phone.verificationStatus}
        phoneNumber={getPhoneNumberDisplay(phone.number)}
        loading={verifyPhoneLoading}
        onClickVerifyButton={() => setVerifyPhoneDialogOpen(true)}
      />
      <VerifyPhoneDialog
        open={verifyPhoneDialogOpen}
        onClose={() => setVerifyPhoneDialogOpen(false)}
        onSubmit={handleVerifyPhone}
      />
    </>
  );
};

export default PhoneController;
