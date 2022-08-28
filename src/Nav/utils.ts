import { matchPath, useLocation } from 'react-router-dom';

/** `useRouteMatch` returns a PathMatch object if the current pathname matches one of the given `patterns`. */
export const useRouteMatch = (patterns: readonly string[]) => {
  const { pathname } = useLocation();

  for (let pattern of patterns) {
    const possibleMatch = matchPath(pattern, pathname);
    if (possibleMatch !== null) return possibleMatch;
  }

  return null;
};

/**
 * `stringToColor` provides a hashed color of a string value.
 * @link https://mui.com/material-ui/react-avatar/
 */
export const stringToColor = (string: string) => {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
};

/**
 * `stringAvatar` provides props for Avatar including a color provided by `stringToColor` and the
 * user's initials as React.Children.
 */
export const stringAvatar = (name: string) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
};
