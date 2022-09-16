import React, { useMemo, StrictMode } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ReactDOM from 'react-dom/client';
import Helmet from 'react-helmet';
import './firebase'; // Keep as one of the first imports since the FIrebase app is initialized here
import { createTheme } from './material';
import reportWebVitals from './reportWebVitals';
import Router from './Router';

const App = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(() => createTheme(prefersDarkMode), [prefersDarkMode]);
  return (
    <ThemeProvider theme={theme}>
      <Helmet titleTemplate="Tsunami.Events - %s">
        <html lang="en" />
        <meta
          name="description"
          content="Tsunami.Events displays recent tsunami alerts and sends SMS updates to participants"
        />
      </Helmet>
      <CssBaseline enableColorScheme={prefersDarkMode} />
      <Router />
    </ThemeProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
