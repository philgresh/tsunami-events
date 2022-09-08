import React from 'react';
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
      setError(new Error(`Unable to verify phone number: ${err}`));
    } finally {
      setLoading(false);
    }
  };

  return {
    error,
    loading,
    isOpen,
    handleVerifyPhone,
    setIsOpen,
    setLoading,
  };
};
