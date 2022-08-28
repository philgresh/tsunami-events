import { createTheme as MuiCreateTheme } from '@mui/material/styles';
import { cyan, purple } from '@mui/material/colors';
import { deepmerge } from '@mui/utils';
import type { ThemeOptions } from '@mui/material/styles';

export const createTheme = (prefersDarkMode: boolean) => {
  const theme: ThemeOptions = {
    palette: {
      mode: 'light',
      primary: {
        main: cyan[400],
      },
      secondary: {
        main: purple[800],
      },
      contrastThreshold: 4,
    },
    typography: {
      /** Use h5 for site title */
      h5: {
        fontFamily: ['Poppins', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      },
    },
    components: {
      MuiTabs: {
        defaultProps: {
          indicatorColor: 'secondary',
          textColor: 'secondary',
        },
      },
    },
  };

  const darkTheme: ThemeOptions = {
    palette: {
      mode: 'dark',
      contrastThreshold: 4,
    },
    components: {
      MuiTabs: {
        defaultProps: {
          indicatorColor: 'primary',
          textColor: 'primary',
        },
      },
    },
  };

  if (prefersDarkMode) return MuiCreateTheme(deepmerge(theme, darkTheme));

  return MuiCreateTheme(theme);
};
