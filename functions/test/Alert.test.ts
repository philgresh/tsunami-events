import fs from 'fs';
import path from 'path';
import { CAP_1_2 } from 'cap-ts';
import { Alert } from '../src/models';

const mockXMLPath = path.resolve(__dirname, './mockCAPAlert.xml');
const readXML = () => fs.readFileSync(mockXMLPath, { encoding: 'utf-8' });

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

  it('constructs correctly without an `eventID` argument', () => {
    const alert = new Alert(defaultCAPAlert);

    expect({ ...alert }).toMatchObject(partialJSON);
    expect(alert.eventID).toBeUndefined();
  });

  it('constructs correctly with an `eventID` argument', () => {
    const alert = new Alert(defaultCAPAlert, 'abcd-1234');

    expect({ ...alert }).toMatchObject(partialJSON);
    expect(alert.eventID).toBe('abcd-1234');
  });
});
