import { CAP_1_2 } from 'cap-ts';
import { Alert } from '../../models';
import { AlertLevel } from '../../models/Alert/types';
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
  const eventID = 'abcd-1234';

  describe('constructor', () => {
    it('constructs correctly without an `eventID` argument', () => {
      const alert = new Alert({ alertJSON: defaultCAPAlert.toJSON() });

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBeUndefined();
    });

    it('constructs correctly with an `eventID` argument', () => {
      const alert = new Alert({ alertJSON: defaultCAPAlert.toJSON(), eventID });

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBe('abcd-1234');
    });

    it('constructs correctly with an `url` argument', () => {
      const alert = new Alert({ alertJSON: defaultCAPAlert.toJSON(), eventID, url });

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.url).toBe(url);
    });

    it('constructs correctly with an `alertLevel` argument', () => {
      const alert = new Alert({
        alertJSON: defaultCAPAlert.toJSON(),
        eventID,
        url,
        alertLevel: 'Warning',
      });

      expect({ ...alert }).toMatchObject({
        ...partialJSON,
        alertLevel: AlertLevel.Warning,
      });
      expect(alert.alertLevel).toBe(AlertLevel.Warning);
    });

    it('calls determineAlertLevel if no `alertLevel` argument is given', () => {
      const alert = new Alert({
        alertJSON: defaultCAPAlert.toJSON(),
        eventID,
        url,
        alertLevel: undefined,
      });

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
      const alert = Alert.fromCAPAlert(defaultCAPAlert, { eventID });

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.eventID).toBe('abcd-1234');
    });

    it('constructs correctly with an `url` argument', () => {
      const alert = Alert.fromCAPAlert(defaultCAPAlert, { eventID, url });

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.url).toBe(url);
    });

    it('calls determineAlertLevel', () => {
      const alert = Alert.fromCAPAlert(defaultCAPAlert, { eventID, url });

      expect({ ...alert }).toMatchObject(partialJSON);
      expect(alert.alertLevel).toBe(AlertLevel.Information);
    });
  });

  describe('fromXML', () => {
    const testFromXML = async (xmlStr: string) => {
      let alert: Alert | undefined = undefined;
      let err: Error | undefined = undefined;

      try {
        alert = await Alert.fromXML(xmlStr);
      } catch (e: any) {
        err = e;
      }
      return { alert, err };
    };

    it('returns a rejected Promise if the Alert XML is not parsable', async () => {
      const { alert, err } = await testFromXML('');
      expect(alert).toBeUndefined();
      expect(err).not.toBeUndefined();
      expect(err?.message).toBe('unable to parse an Alert from an XML document: Error: Unable to parse alert');
    });

    it('returns a resolved Promise with the value of an Alert if we can parse the XML', async () => {
      const { alert, err } = await testFromXML(readXML());
      expect(alert).not.toBeUndefined();
      expect(err).toBeUndefined();
    });
  });

  describe('determineAlertLevel', () => {
    let alert: Alert;
    beforeEach(() => {
      alert = new Alert({ alertJSON: defaultCAPAlert.toJSON() });
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

  describe('toDB', () => {
    let alert = Alert.fromCAPAlert(defaultCAPAlert, { eventID, url });
    beforeEach(() => {
      alert = Alert.fromCAPAlert(defaultCAPAlert, { eventID, url });
    });

    it('converts an Alert to a POJO', () => {
      expect(alert.toDB()).toMatchObject(partialJSON);
    });

    it('eliminates nil values', () => {
      alert.url = undefined;
      const dbAlert = alert.toDB();
      expect(dbAlert.url).toBeUndefined();
    });

    it('sets the `alertLevel` value to a string', () => {
      const dbAlert = alert.toDB();
      expect(dbAlert.alertLevel).toBe('Information');
    });
  });
});
