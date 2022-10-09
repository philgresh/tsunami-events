import * as React from 'react';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import styled from 'styled-components';
import type { Theme } from '@mui/material';

const StyledHeroLayout = styled('section')(({ theme }) => ({
  color: theme.palette.common.white,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  [theme.breakpoints.up('sm')]: {
    height: '80vh',
    minHeight: 500,
    maxHeight: 1300,
  },
}));

const StyledBackground = styled(Box)({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  zIndex: -2,
});

interface HeroLayoutProps {
  sxBackground: SxProps<Theme>;
}

const HeroLayout = (props: React.HTMLAttributes<HTMLDivElement> & HeroLayoutProps) => {
  const { sxBackground, children } = props;
  const theme = useTheme();
  return (
    <StyledHeroLayout theme={theme}>
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
        <StyledBackground sx={sxBackground} />
        <ArrowCircleDownIcon color="action" fontSize="large" sx={{ position: 'absolute', bottom: 32 }} />
      </Container>
    </StyledHeroLayout>
  );
};

export default HeroLayout;
