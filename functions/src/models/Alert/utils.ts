import { AlertLevel } from './types';

/**
 * `getAlertLevel` returns the AlertLevel enum value of an equivalent string.
 */
export const getAlertLevel = (str: string): AlertLevel => {
  if (!str?.toLowerCase()) return AlertLevel.DO_NOT_USE;

  if (str.toLowerCase().includes('warning')) return AlertLevel.Warning;
  if (str.toLowerCase().includes('advisory')) return AlertLevel.Advisory;
  if (str.toLowerCase().includes('watch')) return AlertLevel.Watch;
  if (str.toLowerCase().includes('information')) return AlertLevel.Information;
  if (str.toLowerCase().includes('cancelation')) return AlertLevel.Cancellation;
  if (str.toLowerCase().includes('cancellation')) return AlertLevel.Cancellation;

  return AlertLevel.DO_NOT_USE;
};
