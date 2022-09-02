import * as React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { NAVBAR_HEIGHT } from '../constants';

export default function CircularIndeterminate() {
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
      <CircularProgress />
    </Box>
  );
}
