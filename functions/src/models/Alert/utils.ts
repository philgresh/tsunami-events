import { CAP_1_2 } from 'cap-ts';
import { AlertLevel } from './types';

const EVENT_LOC_NAME_VALUENAME = 'EventLocationName';
const EVENT_PRELIM_MAG_VALUENAME = 'EventPreliminaryMagnitude';

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

/**
 * `getEarthquakeLocDesc` parses a given `parameter_list` and returns a formatted
 * string of the event's estimated magnitude and location.
 * @example
 * const parameterList = [
      {
        value: 'near the Tonga Islands',
        valueName: 'EventLocationName',
      },
      {
        value: '7.6',
        valueName: 'EventPreliminaryMagnitude',
      },
      // ...
    ];
    getEarthquakeLocDesc(parameterList); // 'magnitude 7.6 earthquake near the Tonga Islands'
 */
export const getEarthquakeLocDesc = (
  parameterList: CAP_1_2.Alert_info_list_info_parameter_list_parameter[]
): string => {
  if (!parameterList?.length) return '';

  let eventLocation: string = '';
  let eventPreliminaryMagnitude: string | number = '';

  parameterList.forEach((param) => {
    if (param.valueName === EVENT_LOC_NAME_VALUENAME) {
      eventLocation = param.value;
    }
    if (param.valueName === EVENT_PRELIM_MAG_VALUENAME) {
      eventPreliminaryMagnitude = param.value;
    }
  });

  // if (!eventLocationNameParam || !eventPreliminaryMagnitudeParam) return '';

  const magnitude = Number.parseFloat(`${eventPreliminaryMagnitude}`).toFixed(1);

  if (!magnitude || !eventLocation) return '';
  return `magnitude ${magnitude} earthquake ${eventLocation}`;
};
