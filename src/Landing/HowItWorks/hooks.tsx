import { useTheme } from '@mui/material/styles';

/**
 * `usePrimaryColor` is a custom hook to return the "primary color" of the theme.
 * This is to ensure a good contrast ratio and high-quality style.
 */
export const usePrimaryColor = () => {
  const theme = useTheme();
  return theme.palette.mode === 'dark' ? 'primary.light' : 'secondary.light';
};
