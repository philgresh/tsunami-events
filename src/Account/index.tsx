import React from 'react';
import Phone from './Phone';
import { Container, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type Props = {};

const AccountItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const theme = useTheme();
  const spacing = theme.spacing(2);

  return (
    <Paper elevation={2} sx={{ padding: spacing }}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

const Account = (props: Props) => {
  const theme = useTheme();
  const spacing = theme.spacing(2);
  return (
    <Stack direction="column" justifyContent="flex-start" alignItems="center" spacing={2}>
      <Container maxWidth="md" sx={{ marginY: spacing }}>
        <Typography variant="h6" sx={{ marginX: spacing }} gutterBottom>
          Manage Account
        </Typography>
        <AccountItem title="Phone Numbers">
          <Phone />
        </AccountItem>
      </Container>
    </Stack>
  );
};

export default Account;
