import React from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Button } from '@mui/material';
import type { DBPhone } from '../../models';

const attemptVerifyPhone = httpsCallable<{ code: string }, DBPhone>(getFunctions(), 'attemptVerifyPhone');

export const useVerifyPhone = () => {
  const [verifyPhoneDialogOpen, setVerifyPhoneDialogOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const handleVerifyPhone = async (verificationCode: string) => {
    setVerifyPhoneDialogOpen(false);
    setLoading(true);
    // try {
    //   await attemptVerifyPhone({ code: verificationCode });
    // } catch (err: any) {
    //   console.error(err);
    //   setError(new Error(`Unable to verify phone number: ${err}`));
    // }
    setLoading(false);
  };

  const VerifyPhoneButton = () => {
    const isDisabled = loading;
    return (
      <Button variant="text" onClick={() => setVerifyPhoneDialogOpen(true)} disabled={isDisabled}>
        {loading ? 'Verifying phone number...' : 'Verify phone number'}
      </Button>
    );
  };

  return {
    error,
    loading,
    verifyPhoneDialogOpen,
    handleVerifyPhone,
    setVerifyPhoneDialogOpen,
    VerifyPhoneButton,
  };
};
