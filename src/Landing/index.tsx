import React from 'react';
import { Stack, Typography, useTheme } from '@mui/material';
import { renderToString } from 'react-dom/server';

const HEADLINE = 'Be the first to know about a potential tsunami event.';

const Headline = () => {
  const theme = useTheme();
  return (
    <Typography variant="h4" sx={{ fontFamily: 'Poppins' }} color={theme.palette.text.primary}>
      {HEADLINE}
    </Typography>
  );
};

const Landing = () => {
  return (
    <Stack spacing={2}>
      <Headline />
    </Stack>
  );
};

const html = renderToString(<Landing />);
console.log({ html });
export default Landing;
