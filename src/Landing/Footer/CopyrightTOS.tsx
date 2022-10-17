import React from 'react';
import { Box, Link, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import { NavPath } from '../../constants';
import type { LinkProps } from 'react-router-dom';

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

  const LinkedText = ({ linkProps, children }: { linkProps: LinkProps; children: React.ReactNode }) => {
    return (
      <Box sx={{ display: 'inline-block' }}>
        <Link component={RouterLink} {...linkProps} underline="hover" color="inherit" variant="overline">
          {children}
        </Link>
      </Box>
    );
  };

  const Divider = () => (
    <Box sx={{ display: 'inline-block' }}>
      <Typography color="inherit" variant="overline" sx={{ marginX: 2 }}>
        |
      </Typography>
    </Box>
  );

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
      <Box sx={{ marginTop: 2 }}>
        <LinkedText linkProps={{ to: NavPath.PrivacyPolicy }}>Privacy Policy</LinkedText>
        <Divider />
        <LinkedText linkProps={{ to: NavPath.ToS }}>Terms of Service</LinkedText>
      </Box>
    </Box>
  );
};

export default CopyrightTOS;
