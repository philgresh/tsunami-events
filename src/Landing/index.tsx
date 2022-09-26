import React from 'react';
import { Box, Container, Stack, Typography, useTheme } from '@mui/material';
import { renderToString } from 'react-dom/server';

const HEADLINE = 'A tsunami can strike any ocean coast at any time.';
const SUBHEADLINE = 'Stay informed about these potentially deadly events as they happen.';

const Headline = () => {
  const theme = useTheme();
  return (
    <div>
      <Typography variant="h4" component="h1" sx={{ fontFamily: 'Poppins' }} color={theme.palette.text.primary}>
        {HEADLINE}
      </Typography>
      <Typography variant="h6" component="h2" color={theme.palette.text.secondary}>
        {SUBHEADLINE}
      </Typography>
    </div>
  );
};

const Landing = () => {
  const theme = useTheme();

  return (
    <Container>
      <Stack spacing={2}>
        <Headline />
      </Stack>
    </Container>
  );
};

const html = renderToString(<Landing />);
console.log({ html });
export default Landing;
