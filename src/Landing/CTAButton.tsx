import React from 'react';
import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavPath } from '../constants';

export type CTAButtonProps = {
  text: string;
};

const CTAButton = ({ text }: CTAButtonProps) => (
  <Button
    color="secondary"
    variant="contained"
    size="large"
    component={RouterLink}
    to={NavPath.SignIn}
    sx={{ minWidth: 200, maxWidth: 500, textAlign: 'center' }}
  >
    {text}
  </Button>
);

export default CTAButton;
