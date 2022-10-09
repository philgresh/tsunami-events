import * as React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { usePrimaryColor } from './hooks';
import type { SxProps, Theme } from '@mui/material/styles';

const CURVY_LINES_PNG = `${process.env.PUBLIC_URL}/curvylines.png`;

const item: SxProps<Theme> = {
  display: 'grid',
  gridTemplateColumns: '50px auto',
  gridColumnGap: '1em',
  gridRowGap: '1em',
};

/**
 * `Step` drops child content in after an `index` number, using a CSS-Grid format internally.
 */
export const Step = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const primaryColor = usePrimaryColor();
  return (
    <Grid item xs={12} key={index}>
      <Box sx={item}>
        <Typography variant="h4" component="span" color={primaryColor} sx={{ paddingTop: '1rem' }}>
          {index}.
        </Typography>
        <div>{children}</div>
      </Box>
    </Grid>
  );
};

/**
 * `HowItWorksLayout` lays out the How It Works section, including a header and
 * styled 'steps'.
 */
const HowItWorksLayout = ({ steps }: { steps: React.ReactNode[] }) => {
  const primaryColor = usePrimaryColor();
  return (
    <Box component="section" sx={{ display: 'flex', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Container
        sx={{
          mt: 10,
          mb: 15,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: 'text.primary',
        }}
      >
        <Box
          component="img"
          src={CURVY_LINES_PNG}
          alt="curvy lines"
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            top: -180,
            opacity: 0.7,
          }}
        />
        <Typography variant="h3" component="h2" sx={{ mb: 14 }} color={primaryColor}>
          How it works
        </Typography>
        <Grid container spacing={5}>
          {steps.map((step, i) => (
            <Step index={i + 1} key={i}>
              {step}
            </Step>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default HowItWorksLayout;
