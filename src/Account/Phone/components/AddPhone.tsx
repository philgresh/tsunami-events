import React from 'react';
import { Button, Link, Stack, Switch, Typography } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input';
import { Phone } from '../../../models';
import { SMS_TOS_LINK, DEFAULT_COUNTRY } from '../constants';
import { useAddPhone } from '../hooks';

export type AddPhoneProps = {
  uid: string;
  setUserPhone: (phone: Phone) => Promise<void>;
};

export const AddPhone = ({ uid, setUserPhone }: AddPhoneProps) => {
  const { error, hasAgreed, numberValue, handleAgreeChange, handleValueChange, handleSubmit } = useAddPhone(
    setUserPhone,
    uid
  );
  const submitDisabled = !numberValue || !hasAgreed || !!error;

  return (
    <Stack justifyContent="flex-start" alignItems="flex-start" spacing={2} direction="column">
      <MuiTelInput
        value={numberValue}
        onChange={handleValueChange}
        preferredCountries={['US', 'CA', 'MX']}
        error={!!error}
        helperText={error && error}
        defaultCountry={DEFAULT_COUNTRY}
      />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 2 }}
        justifyContent="flex-start"
        alignItems="center"
      >
        <Typography variant="body2">
          I agree with the&nbsp;
          <Link href={SMS_TOS_LINK} rel="noopener" target="_blank">
            SMS Terms of Service
          </Link>
        </Typography>
        <Switch checked={hasAgreed} onChange={handleAgreeChange} inputProps={{ 'aria-label': 'controlled' }} />
      </Stack>
      <Button variant="contained" disabled={submitDisabled} onClick={handleSubmit}>
        Add Phone
      </Button>
    </Stack>
  );
};

export default AddPhone;
