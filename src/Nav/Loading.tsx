import * as React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { NAVBAR_HEIGHT } from '../constants';
import type { CircularProgressProps } from '@mui/material';

const CircularIndeterminate = (props?: CircularProgressProps) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        width: '100%',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: 'translateY(-20%)',
      }}
    >
      <CircularProgress {...props} />
    </Box>
  );
};

export default CircularIndeterminate;
