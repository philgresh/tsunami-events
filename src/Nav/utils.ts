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
