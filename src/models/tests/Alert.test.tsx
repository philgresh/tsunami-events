import Alert from '../Alert';
import { AlertLevel } from '../Alert/types';
import dbAlertPAAQ10r5qho6 from './test_data/dbAlert-PAAQ-10-r5qho6.json';
import type { DBAlert } from '../Alert/types';

const dbAlert = dbAlertPAAQ10r5qho6 as Record<string, any> as DBAlert;

describe('Alert', () => {
  describe('constructor', () => {
    const alert1 = new Alert();
    it('returns an Alert instance', () => {
      const alert2 = new Alert();
      expect(alert2).toBeInstanceOf(Alert);
      expect(alert2).not.toBe(alert1);
    });
  });

  describe('`fromDB` static method', () => {
    const alert = Alert.fromDB(dbAlert);
    it('returns an Alert instance', () => {
      expect(alert).toBeInstanceOf(Alert);
    });

    it('assigns the attributes from the DBAlert instance', () => {
      expect(alert.identifier).toBe(dbAlert.identifier);
      expect(alert.url).toBe(dbAlert.url);
      expect(alert.manuallyAdded).toBe(dbAlert.manuallyAdded);
    });
  });

  describe('`getTitlizedAlertLevel` instance method', () => {
    let alert: Alert;
    beforeEach(() => {
      alert = Alert.fromDB(dbAlert);
    });

    it('returns an empty string if the `alertLevel` is `DO_NOT_USE`', () => {
      alert.alertLevel = AlertLevel.DO_NOT_USE;
      expect(alert.getTitlizedAlertLevel()).toBe('');
    });

    it('returns an empty string if the `alertLevel` is `undefined`', () => {
      alert.alertLevel = undefined;
      expect(alert.getTitlizedAlertLevel()).toBe('');
    });

    it("returns the titlized string of the instance's `alertLevel`", () => {
      expect(alert.getTitlizedAlertLevel()).toBe('Advisory');
    });
  });
});
