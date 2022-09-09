import React from 'react';
import { matchIsValidTel } from 'mui-tel-input';
import { Phone } from '../../models';
import { DEFAULT_COUNTRY } from './constants';
import type { AttemptVerifyPhoneType, SetUserPhoneType } from './functions';

/**
 * `useVerifyPhone` is a custom hook storing state, actions, and components
 * related to verifying a user's phone number.
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

/**
 * `useAddPhone` is a custom hook storing state, actions, and components
 * related to adding a user's phone number.
 */
export const useAddPhone = (setUserPhone: SetUserPhoneType, uid: string) => {
  const [error, setError] = React.useState<string | undefined>();
  const [numberValue, setNumberValue] = React.useState<string>('');
  const [hasAgreed, setHasAgreed] = React.useState(false);

  const handleAgreeChange = (_e: React.ChangeEvent<HTMLInputElement> | undefined, checked: boolean) =>
    setHasAgreed(checked);
  const handleValueChange = (value: string) => {
    /**
     * value: "+33123456789"
     * info: {
     *  countryCallingCode: "33",
     *  countryCode: "FR",
     *  nationalNumber: "123456789",
     *  numberValue: "+33123456789",
     *  reason: "input"
     * }
     **/
    setError(undefined);
    setNumberValue(value);
  };
  const handleSubmit = async () => {
    if (!matchIsValidTel(numberValue, DEFAULT_COUNTRY)) {
      setError('Invalid phone number format');
      return;
    }

    const phone = new Phone({ number: numberValue.replace(/\s/g, ''), participantID: uid });
    try {
      await setUserPhone(phone);
      setError(undefined);
    } catch (err: any) {
      setError(err?.message ?? err);
    }
  };

  return {
    error,
    hasAgreed,
    numberValue,
    handleAgreeChange,
    handleValueChange,
    handleSubmit,
    /** Note: `setError` is exposed only for testing */
    setError,
  };
};
