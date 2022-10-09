import * as React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import HowItWorksLayout from './HowItWorksLayout';
import type { Theme } from '@mui/material/styles';

import type { SxProps } from '@mui/system';

const SEISMIC_WAVE_PNG = `${process.env.PUBLIC_URL}/seismic-wave.png`;

const image: SxProps<Theme> = {
  height: 55,
};

const HowItWorks = () => {
  const theme = useTheme();

  const StepOne = () => (
    <Box sx={{ position: 'relative' }}>
      <Box
        component="img"
        src={SEISMIC_WAVE_PNG}
        alt="seismic wave"
        sx={{
          ...image,
          width: '100%',
          maxWidth: '500px',
          height: '100%',
          objectFit: 'cover',
          filter: 'opacity(50%)',
          transform: 'translate(-15%, -25%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: `${theme.palette.background.paper}80`, // Opaque 50%
          padding: '1rem',
          borderRadius: '1rem',
          a: {
            textDecoration: '1px dotted currentColor',
          },
        }}
      >
        <Typography variant="h4" component="h3" gutterBottom>
          An earthquake strikes
        </Typography>
        <Typography variant="body2">Sensors around the globe detect movement</Typography>
      </Box>
    </Box>
  );

  return <HowItWorksLayout steps={[<StepOne />]} />;
};

export default HowItWorks;
