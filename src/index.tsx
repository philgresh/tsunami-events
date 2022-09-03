import React, { useMemo, StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import Helmet from 'react-helmet';
import { Routes } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './firebase'; // Keep as one of the first imports since the FIrebase app is initialized here
import Sentry from './sentry';
import Router from './Router';
import reportWebVitals from './reportWebVitals';
import { createTheme } from './material';

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

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
      <SentryRoutes>
        <Router />
      </SentryRoutes>
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
