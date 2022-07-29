import { AxiosResponse } from 'axios';
import fs from 'fs';
import mockAxios from 'jest-mock-axios';
import path from 'path';
import sinon from 'sinon';
import { fetchAndParseLatestEvents, parseAtomFeed } from '../src/CAPdocument';
import * as utils from '../src/utils';
import { getValidAtomFeed } from './mockData';
import type { Entry } from '../src/types';

const mockXMLPath = path.resolve(__dirname, './mockCAPAlert.xml');
const readXML = () => fs.readFileSync(mockXMLPath, { encoding: 'utf-8' });

const defaultEntry: Entry = {
  id: 'urn:uuid:7d3dea95-b739-4cb3-a688-92422cb8b942',
  title: '180 miles SE of Kodiak City, Alaska',
  updated: '2022-07-15T22:37:07Z',
  capXMLURL: 'http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/PAAQCAP.xml',
};

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
    expect(parsedAtomFeed?.feedID).toBe('urn:uuid:7d3dea95-b739-4cb3-a688-92422cb8b942');
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

describe('fetchAndParseLatestEvents', () => {
  const validAtomFeed = getValidAtomFeed();

  afterEach(() => {
    mockAxios.reset();
  });

  /** `testFetchAndParseLatestEvents` is a test-only helper that returns an object rather than a Promise. */
  const testFetchAndParseLatestEvents = async () =>
    fetchAndParseLatestEvents()
      .then(({ alert }) => ({
        alert,
        err: undefined,
      }))
      .catch((err) => ({
        alert: undefined,
        err,
      }));

  it('catches errors within `fetchXMLDocument`', async () => {
    const mockResp: Partial<AxiosResponse> = {
      status: 404,
      statusText: 'Not found',
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    const { alert, err } = await testFetchAndParseLatestEvents();
    expect(alert).toBeUndefined();
    expect(err?.message).toBe(
      "Unable to parse NTWC Tsunami Atom feed: unable to fetch XML document: received status '404' (Not found)"
    );
  });

  it('catches errors within `parseAtomFeed`', async () => {
    const mockResp: Partial<AxiosResponse> = {
      status: 200,
      data: 'not a parseable XML document',
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    const { alert, err } = await testFetchAndParseLatestEvents();
    expect(alert).toBeUndefined();
    expect(err?.message).toBe(
      "Unable to parse NTWC Tsunami Atom feed: unable to parse feed XML document: char 'n' is not expected.:1:1"
    );
  });

  describe('for each parsed entry', () => {
    const mockCAPAlert = readXML();
    const fetchXMLDocumentSpy = sinon.spy(utils, 'fetchXMLDocument');
    const handleErrorSpy = sinon.spy(utils, 'handleError');

    it("calls `fetchXMLDocument` with the entry's capXMLURL", () => {
      const mockAtomFeedResponse: Partial<AxiosResponse> = {
        status: 200,
        data: validAtomFeed,
      };
      const mockCAPXMLResponse: Partial<AxiosResponse> = {
        status: 200,
        data: mockCAPAlert,
      };

      mockAxios.get.mockResolvedValueOnce(mockAtomFeedResponse);
      mockAxios.get.mockResolvedValueOnce(mockCAPXMLResponse);

      testFetchAndParseLatestEvents();
      expect(handleErrorSpy.called).toBe(false);
      expect(fetchXMLDocumentSpy.getCalls()?.[0]?.args?.[0]).toBe('https://www.tsunami.gov/events/xml/PAAQAtom.xml');
    });
  });
});
