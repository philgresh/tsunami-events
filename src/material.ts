import { createTheme as MuiCreateTheme } from '@mui/material/styles';
import cyan from '@mui/material/colors/cyan';
import deepPurple from '@mui/material/colors/deepPurple';

export const createTheme = (prefersDarkMode: boolean) =>
  MuiCreateTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: cyan[400],
      },
      secondary: {
        main: deepPurple[400],
      },
    },
    typography: {
      /** Use h5 for site title */
      h5: {
        fontFamily: ['Poppins', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
      },
    },
  });
