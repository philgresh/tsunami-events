import * as React from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styled from 'styled-components';
import CTAButton from '../CTAButton';
import HeroLayout from './HeroLayout';
import type { Theme } from '@mui/material';

const BACKGROUND_IMAGE_URL_JPG = `${process.env.PUBLIC_URL}/spencer-watson-eo3tBGMR9yY-unsplash.jpg`;
const BACKGROUND_IMAGE_URL_WEBP = `${process.env.PUBLIC_URL}/spencer-watson-eo3tBGMR9yY-unsplash.webp`;
const BACKGROUND_IMAGE_FALLBACK_COLOR = '#fcdbae';

const StyledHeadline = styled.hgroup<{ theme: Theme }>`
  padding: ${(props) => props.theme.spacing(2)};
  padding-bottom: ${(props) => props.theme.spacing(6)};
`;

const Hero = () => {
  const theme = useTheme();
  return (
    <HeroLayout
      background={{
        backgroundColor: BACKGROUND_IMAGE_FALLBACK_COLOR,
        backgroundImageJpg: BACKGROUND_IMAGE_URL_JPG,
        backgroundImageWebp: BACKGROUND_IMAGE_URL_WEBP,
      }}
      id="hero"
    >
      <StyledHeadline theme={theme}>
        <Typography
          color="#111"
          align="center"
          variant="h3"
          component="h1"
          sx={{
            fontFamily: 'Poppins,Roboto,Helvetica,Arial,sans-serif',
          }}
        >
          A tsunami can strike <em>any</em> ocean coast at <em>any</em> time.
        </Typography>
        <Typography
          color="#222"
          align="center"
          variant="h5"
          component="h2"
          sx={{
            mb: 4,
            mt: 4,
            textShadow: `0px 0px 2px ${BACKGROUND_IMAGE_FALLBACK_COLOR}`,
          }}
        >
          Stay informed about these potentially deadly events as they happen.
        </Typography>
      </StyledHeadline>
      <CTAButton text="Register to receive updates" />
    </HeroLayout>
  );
};

export default Hero;
