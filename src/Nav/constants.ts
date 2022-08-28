import { NavPath } from '../constants';
import type { NavItem } from './types';

export const DRAWER_WIDTH = 240;
export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Events',
    path: NavPath.Events,
    matchingPaths: new Set([NavPath.EventsCollection, NavPath.Events]),
  },
];
