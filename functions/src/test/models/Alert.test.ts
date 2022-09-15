import { CAP_1_2 } from 'cap-ts';
import { Alert } from '../../models';
import { AlertLevel } from '../../models/Alert';
import { readXML } from '../test_utils';

const defaultCAPAlert = CAP_1_2.Alert.fromXML(readXML());

describe('Alert', () => {
  const partialJSON: Partial<CAP_1_2.Alert_toJSON_type> = {
    identifier: 'PAAQ-1-rcz9ap',
    sender: 'ntwc@noaa.gov',
    sent: '2022-06-05T00:05:50-00:00',
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    code_list: ['IPAWSv1.0'],
    // `info_list` omitted for simplicity
    // `elem_list` omitted for simplicity
    addresses: '',
    references: '',
    source: 'NTWC',
    incidents: 'rcz9ap',
    restriction: '',
    note: '',
  };
  const url = 'https://tsunami.gov/events/PAAQ/2022/06/04/rcz9ap/1/WEAK53/PAAQCAP.xml';

  describe('constructor', () => {
    it('constructs correctly without an `eventID` argument', () => {
      const alert = new Alert(defaultCAPAlert.toJSON());

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBeUndefined();
    });

    it('constructs correctly with an `eventID` argument', () => {
      const alert = new Alert(defaultCAPAlert.toJSON(), 'abcd-1234');

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBe('abcd-1234');
    });

    it('constructs correctly with an `url` argument', () => {
      const alert = new Alert(defaultCAPAlert.toJSON(), 'abcd-1234', url);

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.url).toBe(url);
    });

    it('calls determineAlertLevel', () => {
      const alert = new Alert(defaultCAPAlert.toJSON(), 'abcd-1234', url);

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.alertLevel).toBe(AlertLevel.Information);
    });
  });

  describe('fromCAPAlert', () => {
    it('constructs correctly without an `eventID` argument', () => {
      const alert = Alert.fromCAPAlert(defaultCAPAlert);

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBeUndefined();
    });

    it('constructs correctly with an `eventID` argument', () => {
      const alert = Alert.fromCAPAlert(defaultCAPAlert, 'abcd-1234');

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBe('abcd-1234');
    });

    it('constructs correctly with an `url` argument', () => {
      const alert = Alert.fromCAPAlert(defaultCAPAlert, 'abcd-1234', url);

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.url).toBe(url);
    });

    it('calls determineAlertLevel', () => {
      const alert = Alert.fromCAPAlert(defaultCAPAlert, 'abcd-1234', url);

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.alertLevel).toBe(AlertLevel.Information);
    });
  });

  describe('determineAlertLevel', () => {
    let alert: Alert;
    beforeEach(() => {
      alert = new Alert(defaultCAPAlert.toJSON());
    });

    it('gets set on call from constructor', () => {
      expect(alert.alertLevel).toBe(AlertLevel.Information);
    });

    it('sets alertLevel when called as instance method', () => {
      alert.info_list[0].event = 'Tsunami Advisory';
      alert.determineAlertLevel();
      expect(alert.alertLevel).toBe(AlertLevel.Advisory);
    });

    it('logs an error if we receive a bad value', () => {
      alert.info_list[0].event = 'blah blah blah';
      alert.determineAlertLevel();
      expect(alert.alertLevel).toBe(AlertLevel.DO_NOT_USE);
    });
  });
});
