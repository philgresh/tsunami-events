import React from 'react';
import { Typography, useTheme } from '@mui/material';
import styled from 'styled-components';
import type { Theme } from '@mui/material';

const BACKGROUND_IMAGE_URL = `${process.env.PUBLIC_URL}/spencer-watson-eo3tBGMR9yY-unsplash.jpg`;
const BACKGROUND_IMAGE_FALLBACK_COLOR = '#fcdbae';
const SECTION_BACKGROUND_GRADIENT = `
background: ${BACKGROUND_IMAGE_FALLBACK_COLOR};
background: linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0) 100%);
`;

const StyledBackground = styled.main<{ theme: Theme }>`
  background: ${BACKGROUND_IMAGE_FALLBACK_COLOR};
  background: url(${BACKGROUND_IMAGE_URL}) bottom center no-repeat, ${BACKGROUND_IMAGE_FALLBACK_COLOR};
  height: 1200px;
`;

const StyledHeadline = styled.section<{ theme: Theme }>`
  padding: ${(props) => props.theme.spacing(2)};
  padding-bottom: ${(props) => props.theme.spacing(6)};
  ${(props) => (props.theme.palette.mode === 'dark' ? SECTION_BACKGROUND_GRADIENT : '')}
`;

const Headline = React.memo(
  ({ theme }: { theme: Theme }) => {
    const textColor = theme.palette.text.primary;
    return (
      <StyledHeadline theme={theme}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: 'Poppins' }} color={textColor}>
          A tsunami can strike <em>any</em> ocean coast at <em>any</em> time.
        </Typography>
        <Typography variant="h6" component="h2" color={textColor}>
          Stay informed about these potentially deadly events as they happen.
        </Typography>
      </StyledHeadline>
    );
  },
  (prevProps, nextProps) => prevProps.theme.palette.mode === nextProps.theme.palette.mode
);

const Landing = () => {
  const theme = useTheme();

  return (
    <StyledBackground theme={theme}>
      <Headline theme={theme} />
    </StyledBackground>
  );
};

export default Landing;
