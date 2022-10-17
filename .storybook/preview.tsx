import React from 'react';
import { themes } from '@storybook/theming';
import { MemoryRouter } from 'react-router-dom';
import { useDarkMode } from 'storybook-dark-mode';
import ThemeProvider from '../src/material';

// create a component that uses the dark mode hook
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  // render your custom theme provider
  return <ThemeProvider prefersDarkMode={useDarkMode()}>{children}</ThemeProvider>;
}

export const decorators = [
  (renderStory: any) => (
    <ThemeWrapper>
      <MemoryRouter>{renderStory()}</MemoryRouter>
    </ThemeWrapper>
  ),
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  darkMode: {
    // Override the default dark theme
    dark: { ...themes.dark },
    // Override the default light theme
    light: { ...themes.normal },
  },
  staticDirs: ['../public'],
};
