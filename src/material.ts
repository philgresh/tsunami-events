import { createTheme as MuiCreateTheme } from '@mui/material/styles';

export const createTheme = (prefersDarkMode: boolean) =>
  MuiCreateTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#26c6da',
      },
      secondary: {
        main: '#7e57c2',
      },
    },
    components: {
      // MuiLink: {
      //   defaultProps: {
      //     component: LinkBehavior,
      //   } as LinkProps,
      // },
      // MuiButtonBase: {
      //   defaultProps: {
      //     LinkComponent: LinkBehavior,
      //   },
      // },
    },
    typography: {
      /** Use h5 for site title */
      h5: {
        fontFamily: ['Poppins', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      },
    },
  });
