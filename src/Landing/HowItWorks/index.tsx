import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePrimaryColor } from './hooks';
import HowItWorksLayout from './HowItWorksLayout';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';

const getStepBackgroundStyles: SxProps<Theme> = (theme: Theme) => ({
  backgroundColor: `${theme.palette.background.paper}80`, // Alpha 50%
  padding: '1rem',
  borderRadius: '1rem',
});

const HowItWorks = () => {
  const theme = useTheme();

  const Step = ({ children, header, content }: { header: string; content?: string; children?: React.ReactNode }) => (
    <Box
      sx={{
        ...getStepBackgroundStyles(theme),
      }}
    >
      <Typography variant="h4" component="h3" gutterBottom color={usePrimaryColor()}>
        {header}
      </Typography>
      <Typography variant="body2">{content}</Typography>
      {children}
    </Box>
  );

  return (
    <HowItWorksLayout
      steps={[
        <Step header="An earthquake strikes." content="Sensors around the globe detect movement." />,
        <Step
          header="Tsunami Warning Centers look closely at the data."
          content="Tsunami warning systems detect earthquakes large enough to cause a tsunami and send warning bulletins before
the waves arrive so that local authorities can evacuate vulnerable populations."
        />,
        <Step
          header="We send you only the most relevant alerts."
          content="Tsunami.Events parses bulletins and sends a text message to participants who have signed up to be alerted for their regions of interest. Earthquakes are global events, but not every one is going to be concerning to you."
        />,
      ]}
    />
  );
};

export default HowItWorks;
