import * as React from 'react';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import styled from 'styled-components';
import type { Theme } from '@mui/material';

const StyledHeroLayout = styled('section')((props) => {
  const theme = props.theme as Theme;
  return {
    color: theme.palette.common.white,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      height: '80vh',
      minHeight: 500,
      maxHeight: 1300,
    },
  };
});

type StyledBackgroundProps = {
  backgroundColor: string;
  backgroundImageJpg: string;
  backgroundImageWebp: string;
};

const StyledBackground = styled(Box)<StyledBackgroundProps>`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: -2;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  background-color: ${(props) => props.backgroundColor};
  background-image: url(${(props) => props.backgroundImageJpg});
  background-image: url(${(props) => props.backgroundImageWebp});
`;

const HeroLayout = (props: React.HTMLAttributes<HTMLDivElement> & { background: StyledBackgroundProps }) => {
  const { background, children, ...divProps } = props;
  const theme = useTheme();
  return (
    <StyledHeroLayout theme={theme} {...divProps}>
      <Container
        sx={{
          mt: 3,
          mb: 14,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
        <Box
          id="landing-hero-backdrop"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'common.black',
            opacity: 0.5,
            zIndex: -1,
          }}
        />
        <StyledBackground {...background} />
        <ArrowCircleDownIcon color="action" fontSize="large" sx={{ position: 'absolute', bottom: 32 }} />
      </Container>
    </StyledHeroLayout>
  );
};

export default HeroLayout;
