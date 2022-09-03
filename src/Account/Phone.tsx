import React from 'react';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Button, Link, Stack, Switch, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { MuiTelInput, matchIsValidTel } from 'mui-tel-input';
import Loading from '../Nav/Loading';
import type { MuiTelInputInfo } from 'mui-tel-input';

const SMS_TOS_LINK = `${process.env.PUBLIC_URL}/sms_tos`;

export type AddOrEditPhoneProps = {
  error?: string;
  phoneNumber?: string;
  onChange: (phoneNumber: string) => void;
};

export const AddOrEditPhone = ({ error, phoneNumber }: AddOrEditPhoneProps) => {
  const [numberValue, setNumberValue] = React.useState<string>(phoneNumber ?? '');
  const [infoValue, setInfoValue] = React.useState<MuiTelInputInfo | undefined>();
  const [agreed, setAgreed] = React.useState(false);

  const handleChange = (value: string, info: MuiTelInputInfo) => {
    /**
    value: "+33123456789"
    info: {
      countryCallingCode: "33",
      countryCode: "FR",
      nationalNumber: "123456789",
      numberValue: "+33123456789",
      reason: "input"
    }
    **/
    setNumberValue(value);
    setInfoValue(info);
  };

  const handleAgreeChange = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => setAgreed(checked);

  // Set `isChanged` based on the user's input. Note that `numberValue` includes spaces, while `phoneNumber` does not.
  const isChanged = infoValue && phoneNumber !== infoValue.numberValue;
  const submitDisabled = !isChanged || !agreed;

  return (
    <Stack justifyContent="flex-start" alignItems="flex-start" spacing={2} direction="column">
      <MuiTelInput
        value={numberValue}
        onChange={handleChange}
        preferredCountries={['US', 'CA', 'MX']}
        error={!!error}
        helperText={error && error}
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
      <Button variant="contained" disabled={submitDisabled}>
        Add Phone
      </Button>
    </Stack>
  );
};

const PhoneController = () => {
  const [user, loading, error] = useAuthState(getAuth());
  const theme = useTheme();

  if (loading) return <Loading />;
  if (error || !user)
    return (
      <Typography
        variant="body1"
        sx={{ color: theme.palette.warning.contrastText, backgroundColor: theme.palette.warning.main }}
      >
        {error?.message ?? 'No user signed in!'}
      </Typography>
    );

  const { uid } = user;
  return <div>{uid}</div>;
};

export default PhoneController;
