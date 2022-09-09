import React from 'react';
import { Container, Link, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Phone from './Phone';
import type { User } from 'firebase/auth';

export const AccountItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const theme = useTheme();
  const spacing = theme.spacing(2);

  return (
    <Paper elevation={2} sx={{ padding: spacing }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  );
};

export const AccountItems = (props: any) => {
  const theme = useTheme();
  const spacing = theme.spacing(2);
  return (
    <Container maxWidth="md" sx={{ marginY: spacing }}>
      <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" spacing={2}>
        <Typography variant="h5" gutterBottom>
          Manage Account
        </Typography>
        {props.children}
      </Stack>
    </Container>
  );
};

export type AccountProps = {
  user: User;
};

const Account = ({ user }: AccountProps) => {
  return (
    <AccountItems>
      <AccountItem title="Phone Number">
        <Phone uid={user.uid} />
      </AccountItem>
      <AccountItem title="Regions of Interest">
        <Typography variant="body2">
          Currently, we will send a message whenever the <Link href="http://wcatwc.arh.noaa.gov/">NTWC</Link> releases a
          tsunami alert. In the future, we will allow users to fine-tune the messages they receive based on the impact
          to regions of interest.
        </Typography>
      </AccountItem>
    </AccountItems>
  );
};
export default Account;
