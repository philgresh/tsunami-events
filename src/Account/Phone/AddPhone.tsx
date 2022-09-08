import React from 'react';
import { Button, Link, Stack, Switch, Typography } from '@mui/material';
import { matchIsValidTel, MuiTelInput } from 'mui-tel-input';
import { Phone } from '../../models';
import { SMS_TOS_LINK, DEFAULT_COUNTRY } from './constants';
import type { MuiTelInputInfo } from 'mui-tel-input';

export type AddPhoneProps = {
  uid: string;
  setUserPhone: (phone: Phone) => Promise<void>;
};

export const AddPhone = ({ uid, setUserPhone }: AddPhoneProps) => {
  const [error, setError] = React.useState<string | undefined>();
  const [numberValue, setNumberValue] = React.useState<string>('');
  const [infoValue, setInfoValue] = React.useState<MuiTelInputInfo | undefined>();
  const [agreed, setAgreed] = React.useState(false);

  const handleChange = (value: string, info: MuiTelInputInfo) => {
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
    setInfoValue(info);
  };

  const handleAgreeChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => setAgreed(checked);

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

  const isChanged = !!infoValue;
  const submitDisabled = !isChanged || !agreed || !!error;

  return (
    <Stack justifyContent="flex-start" alignItems="flex-start" spacing={2} direction="column">
      <MuiTelInput
        value={numberValue}
        onChange={handleChange}
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
        <Switch checked={agreed} onChange={handleAgreeChange} inputProps={{ 'aria-label': 'controlled' }} />
      </Stack>
      <Button variant="contained" disabled={submitDisabled} onClick={handleSubmit}>
        Add Phone
      </Button>
    </Stack>
  );
};

export default AddPhone;
