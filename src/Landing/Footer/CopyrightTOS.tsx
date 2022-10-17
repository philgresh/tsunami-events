import React from 'react';
import { Box, Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { NavPath } from '../../constants';
import type { LinkProps } from 'react-router-dom';

const LICENSE_URL = 'https://spdx.org/licenses/GPL-3.0-or-later.html';

/**
 * `CopyrightTOS` displays the copyright and links to the privacy policy, TOS, license, etc.
 * It does not change between light/dark mode.
 */
const CopyrightTOS = () => {
  const theme = useTheme();

  const lightGrey = theme.palette.grey[300];
  const medGrey = theme.palette.grey[500];
  const darkGrey = theme.palette.grey[900];

  const Copyright = () => (
    <Box>
      <Typography variant="caption" color={medGrey}>
        © 2022&nbsp;
        <Link href="mailto:phil+tsunami@gresham.dev" underline="hover" color="inherit">
          Phil Gresham
        </Link>
      </Typography>
    </Box>
  );

  const InternalLink = ({ linkProps, children }: { linkProps: LinkProps; children: React.ReactNode }) => {
    return (
      <Box sx={{ display: 'inline-block' }}>
        <Link component={RouterLink} {...linkProps} underline="hover" color="inherit" variant="overline">
          {children}
        </Link>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        borderTop: `2px solid ${medGrey}`,
        background: darkGrey,
        padding: 2,
        textAlign: 'center',
        color: lightGrey,
      }}
    >
      <Copyright />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0, sm: 2, md: 4 }}
        justifyContent="center"
        sx={{ marginTop: 2 }}
      >
        <InternalLink linkProps={{ to: NavPath.PrivacyPolicy }}>Privacy Policy</InternalLink>
        <InternalLink linkProps={{ to: NavPath.ToS }}>Terms of Service</InternalLink>
        <Link href={LICENSE_URL} underline="hover" color="inherit" variant="overline">
          License
        </Link>
      </Stack>
    </Box>
  );
};

export default React.memo(CopyrightTOS);
