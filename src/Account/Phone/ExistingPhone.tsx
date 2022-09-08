import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { VerificationStatus } from '../../models';

export type ExistingPhoneProps = {
  phoneNumber: string;
  loading: boolean;
  status?: VerificationStatus;
  onClickVerifyButton: () => void;
};

export const ExistingPhone = ({ loading, phoneNumber, status, onClickVerifyButton }: ExistingPhoneProps) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={{ xs: 1, sm: 2 }} justifyContent="flex-start" alignItems="center">
      <Typography variant="body2">{phoneNumber}</Typography>
      {status === 'approved' ? (
        <Typography variant="overline" color={theme.palette.success.main}>
          Verified
        </Typography>
      ) : (
        <Button variant="text" onClick={onClickVerifyButton} disabled={loading}>
          {loading ? 'Verifying phone number...' : 'Verify phone number'}
        </Button>
      )}
    </Stack>
  );
};

export default React.memo(ExistingPhone);
