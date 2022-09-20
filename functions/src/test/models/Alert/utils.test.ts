import { CAP_1_2 } from 'cap-ts';
import { getAlertLevel, getEarthquakeLocDesc } from '../../../models/Alert/utils';
import { AlertLevel } from '../../../models/Alert/types';

describe('getAlertLevel', () => {
  it('returns AlertLevel.DO_NOT_USE if the given string is empty/undefined', () => {
    expect(getAlertLevel('')).toBe(AlertLevel.DO_NOT_USE);
  });

  it('returns AlertLevel.DO_NOT_USE if the given string is not matched', () => {
    expect(getAlertLevel('blhadfsafjlkdsjf')).toBe(AlertLevel.DO_NOT_USE);
  });

  it('returns AlertLevel.Warning if the string contains "warning"', () => {
    expect(getAlertLevel('Tsunami Warning')).toBe(AlertLevel.Warning);
  });

  it('returns AlertLevel.Advisory if the string contains "advisory"', () => {
    expect(getAlertLevel('Tsunami Advisory')).toBe(AlertLevel.Advisory);
  });

  it('returns AlertLevel.Watch if the string contains "watch"', () => {
    expect(getAlertLevel('Tsunami Watch')).toBe(AlertLevel.Watch);
  });

  it('returns AlertLevel.Information if the string contains "information"', () => {
    expect(getAlertLevel('Tsunami Information')).toBe(AlertLevel.Information);
  });

  it('returns AlertLevel.Cancellation if the string contains "cancellation" (two els)', () => {
    expect(getAlertLevel('Tsunami Cancellation')).toBe(AlertLevel.Cancellation);
  });

  it('returns AlertLevel.Cancellation if the string contains "cancelation" (one el)', () => {
    expect(getAlertLevel('Tsunami Cancelation')).toBe(AlertLevel.Cancellation);
  });
});

describe('getEarthquakeLocDesc', () => {
  it('returns an empty string if no parameter list is empty', () => {
    expect(getEarthquakeLocDesc([])).toBe('');
  });

  it('returns an empty string if no `EventLocationName` or `EventPreliminaryMagnitude` parameters are in the list', () => {
    const parameterList = [
      {
        value: 'Ml',
        valueName: 'EventPreliminaryMagnitudeType',
      },
    ];

    expect(getEarthquakeLocDesc(parameterList)).toBe('');
  });

  it('returns a formatted string when both parameters are present', () => {
    const parameterList = [
      {
        value: 'near the Tonga Islands',
        valueName: 'EventLocationName',
      },
      {
        value: '1',
        valueName: 'EventPreliminaryMagnitude',
      },
      {
        value: 'Ml',
        valueName: 'EventPreliminaryMagnitudeType',
      },
    ];
    expect(getEarthquakeLocDesc(parameterList)).toBe('magnitude 1.0 earthquake near the Tonga Islands');
  });

  it('handles numerical magnitude values', () => {
    // Incongruent behavior seen when parsing XMLs
    const parameterList = [
      {
        value: 'near the Tonga Islands',
        valueName: 'EventLocationName',
      },
      {
        value: 7.6,
        valueName: 'EventPreliminaryMagnitude',
      },
      {
        value: 'Ml',
        valueName: 'EventPreliminaryMagnitudeType',
      },
    ];
    expect(
      getEarthquakeLocDesc(parameterList as unknown as CAP_1_2.Alert_info_list_info_parameter_list_parameter[])
    ).toBe('magnitude 7.6 earthquake near the Tonga Islands');
  });
});
