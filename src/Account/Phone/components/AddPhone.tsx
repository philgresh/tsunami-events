import React from 'react';
import { Button, FormControlLabel, FormGroup, Link, Stack, Switch, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input';
import { Phone } from '../../../models';
import { SMS_TOS_LINK, DEFAULT_COUNTRY } from '../constants';
import { useAddPhone } from '../hooks';

export type PhoneNumberInputProps = {
  value: string;
  handleChange: (value: string) => void;
  error?: string;
};

export type AddPhoneProps = {
  uid: string;
  setUserPhone: (phone: Phone) => Promise<void>;
};

/** `PhoneNumberInput` is the main subcomponent of `AddPhone`. */
export const PhoneNumberInput = ({ value, handleChange, error }: PhoneNumberInputProps) => (
  <MuiTelInput
    value={value}
    onChange={handleChange}
    preferredCountries={['US', 'CA', 'MX']}
    error={!!error}
    helperText={error && error}
    defaultCountry={DEFAULT_COUNTRY}
    aria-label="Phone number"
  />
);

export const AddPhone = ({ uid, setUserPhone }: AddPhoneProps) => {
  const theme = useTheme();
  const { error, hasAgreed, numberValue, handleAgreeChange, handleValueChange, handleSubmit } = useAddPhone(
    setUserPhone,
    uid
  );
  const SwitchLabel = () => (
    <Typography variant="body2" sx={{ color: theme.palette.text.primary }} id="SMS TOS Agree Switch">
      I agree with the&nbsp;
      <Link href={SMS_TOS_LINK} rel="noopener" target="_blank" aria-label="SMS TOS">
        SMS Terms of Service
      </Link>
    </Typography>
  );

  return (
    <Stack justifyContent="flex-start" alignItems="flex-start" spacing={2} direction="column">
      <PhoneNumberInput value={numberValue} handleChange={handleValueChange} error={error} />
      <FormGroup>
        <FormControlLabel
          control={<Switch checked={hasAgreed} onChange={handleAgreeChange} aria-labelledby="SMS TOS Agree Switch" />}
          label={<SwitchLabel />}
        />
      </FormGroup>
      <Button variant="contained" disabled={!numberValue || !hasAgreed || !!error} onClick={handleSubmit}>
        Add Phone
      </Button>
    </Stack>
  );
};

export default AddPhone;
