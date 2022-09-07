import React from 'react';
import { Button } from '@mui/material';
import type { AttemptVerifyPhoneType } from './functions';

/**
 * `useVerifyPhone` is a custom hook storing state, actions, and components related to verifying
 * a user's phone number.
 */
export const useVerifyPhone = (attemptVerifyPhone: AttemptVerifyPhoneType) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | undefined>();

  const handleVerifyPhone = async (verificationCode: string) => {
    setIsOpen(false);
    setLoading(true);
    try {
      await attemptVerifyPhone({ code: verificationCode });
    } catch (err: any) {
      console.error(err);
      setError(new Error(`Unable to verify phone number: ${err}`));
    } finally {
      setLoading(false);
    }
  };

  const VerifyPhoneButton = () => {
    const isDisabled = loading;
    return (
      <Button variant="text" onClick={() => setIsOpen(true)} disabled={isDisabled}>
        {loading ? 'Verifying phone number...' : 'Verify phone number'}
      </Button>
    );
  };

  return {
    error,
    loading,
    isOpen,
    handleVerifyPhone,
    setIsOpen,
    VerifyPhoneButton,
  };
};
