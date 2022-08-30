import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { AxiosResponse } from 'axios';
import mockAxios from 'jest-mock-axios';
import { fetchAndParseEvent, parseAtomFeed } from '../src/AtomFeed';
import { NTWC_TSUNAMI_FEED_URL } from '../src/constants';
import { getValidAtomFeed } from './mockData';

const mockAlertXMLPath = path.resolve(__dirname, './mockCAPAlert.xml');
const readAlertXML = () => fs.readFileSync(mockAlertXMLPath, { encoding: 'utf-8' });

describe('parseAtomFeed', () => {
  /** `testParseAtomFeed` is a test-only helper that returns an object rather than a Promise. */
  const testParseAtomFeed = async (xmlStrArg: string) =>
    parseAtomFeed(xmlStrArg)
      .then((parsedAtomFeed) => ({
        parsedAtomFeed,
        err: undefined,
      }))
      .catch((err) => ({
        parsedAtomFeed: undefined,
        err,
      }));

  it('returns a rejected Promise if an `xmlStr` argument is not given', async () => {
    const { parsedAtomFeed, err } = await testParseAtomFeed('');
    expect(parsedAtomFeed).toBeUndefined();
    expect(err?.message).toBe('unable to parse feed XML document: no XML document string given');
  });

  it('returns a rejected Promise if a xmlStr argument is not a valid XML document', async () => {
    const { parsedAtomFeed, err } = await testParseAtomFeed('not a parseable XML document');
    expect(parsedAtomFeed).toBeUndefined();
    expect(err?.message).toBe("unable to parse feed XML document: char 'n' is not expected.:1:1");
  });

  it('parses the given Atom feed and returns an object of type ParsedAtomFeed', async () => {
    const { parsedAtomFeed, err } = await testParseAtomFeed(getValidAtomFeed());
    expect(err).toBeUndefined();
    expect(parsedAtomFeed?.entries?.length).toBe(1);
    expect(parsedAtomFeed?.entries?.[0]?.capXMLURL).toBe(
      'http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/PAAQCAP.xml'
    );
    expect(parsedAtomFeed?.feedID).toBe('7d3dea95-b739-4cb3-a688-92422cb8b942');
  });

  it('handles and returns multiple Atom feed entries', async () => {
    const secondEntryLinkURL = 'https://gresham.dev';
    const secondEntry = `<entry><link rel="related" title="CapXML document" href="${secondEntryLinkURL}" type="application/cap+xml" /></entry>`;
    const { parsedAtomFeed, err } = await testParseAtomFeed(getValidAtomFeed(secondEntry));
    expect(err).toBeUndefined();
    expect(parsedAtomFeed?.entries?.length).toBe(2);
    expect(parsedAtomFeed?.entries?.[1]?.capXMLURL).toBe(secondEntryLinkURL);
  });
});

describe('fetchAndParseEvent', () => {
  const defaultURL = NTWC_TSUNAMI_FEED_URL;
  const defaultURLTitle = 'NTWC Tsunami Atom Feed';

  afterEach(() => {
    mockAxios.reset();
  });

  it('validates inputs', async () => {
    expect(fetchAndParseEvent('', defaultURLTitle)).rejects.toThrowError(
      "Unable to fetch and parse event 'NTWC Tsunami Atom Feed': no URL given"
    );
  });

  it('catches errors within `fetchXMLDocument`', async () => {
    const mockResp: Partial<AxiosResponse> = {
      status: 400,
      statusText: 'Bad Argument',
      data: getValidAtomFeed(),
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    let err: Error | undefined;
    try {
      await fetchAndParseEvent(defaultURL, defaultURLTitle);
    } catch (e) {
      err = e;
    }
    expect(err?.message).toBe(
      "Unable to parse NTWC Tsunami Atom Feed: unable to fetch XML document: received status '400' (Bad Argument)"
    );
  });

  it('catches errors within `parseAtomFeed`', async () => {
    const mockResp: Partial<AxiosResponse> = {
      status: 200,
      data: 'not a parseable XML document',
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    let err: Error | undefined;
    try {
      await fetchAndParseEvent(defaultURL, defaultURLTitle);
    } catch (e) {
      err = e;
    }
    expect(err?.message).toBe(
      "Unable to parse NTWC Tsunami Atom Feed: unable to parse feed XML document: char 'n' is not expected.:1:1"
    );
  });

  it('throws an error when the ID is missing from the `parsedAtomFeed`', async () => {
    const idRegExp = new RegExp(/\<id\>.*<\/id\>/i);

    const mockResp: Partial<AxiosResponse> = {
      status: 200,
      // Remove the ID entirely
      data: getValidAtomFeed().replace(idRegExp, ''),
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    let err: Error | undefined;
    try {
      await fetchAndParseEvent(defaultURL, defaultURLTitle);
    } catch (e) {
      err = e;
    }
    expect(err?.message).toBe('Error on fetchAndParseEvent: given Atom feed was not parsed correctly');
  });
});
