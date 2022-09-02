import { AxiosResponse } from 'axios';
import * as functions from 'firebase-functions';
import mockAxios from 'jest-mock-axios';
import { fetchXMLDocument, getLinkForCapDocument, handleError } from '../utils';
import { NTWC_TSUNAMI_FEED_URL } from '../constants';
import { getValidAtomFeed } from './mockData';
import type { Entry, ErrorResp } from '../types';

const defaultEntry: Entry = {
  id: 'urn:uuid:7d3dea95-b739-4cb3-a688-92422cb8b942',
  title: '180 miles SE of Kodiak City, Alaska',
  updated: '2022-07-15T22:37:07Z',
  capXMLURL: 'http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/PAAQCAP.xml',
};

describe('getLinkForCapDocument', () => {
  it('returns an empty string if given an undefined `entry`', () => {
    expect(getLinkForCapDocument(undefined)).toBe('');
  });

  it('returns an empty string if given an `entry` with no `link`s', () => {
    expect(getLinkForCapDocument(defaultEntry)).toBe('');
  });

  it('returns an empty string if none of the given `link`s are of type `application/cap+xml`', () => {
    const entry = {
      ...defaultEntry,
      link: [
        {
          '@_rel': 'alternate',
          '@_title': 'Bulletin',
          '@_href': 'http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/WEAK53.txt',
          '@_type': 'application/xml',
        },
      ],
    };
    expect(getLinkForCapDocument(entry)).toBe('');
  });

  it('returns a CAP XML URL if found within an entry', () => {
    const entry = {
      ...defaultEntry,
      link: [
        {
          '@_rel': 'related',
          '@_title': 'CapXML document',
          '@_href': 'http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/PAAQCAP.xml',
          '@_type': 'application/cap+xml',
        },
      ],
    };
    expect(getLinkForCapDocument(entry)).toBe(
      'http://ntwc.arh.noaa.gov/events/PAAQ/2022/07/15/rf32nv/1/WEAK53/PAAQCAP.xml'
    );
  });
});

describe('handleError', () => {
  const errDetails = {
    error: 'The requested URL /events/xml/PAAQAsdftom.xml was not found on this server.',
  };
  const defaultErrorResp: ErrorResp = {
    statusCode: 'internal',
    message: '404 Not Found',
    data: errDetails,
  };

  /** `testHandleError` is a test-only helper that catches and returns an Error thrown from `handleError` */
  const testHandleError = (errorRespOverride?: Partial<ErrorResp>): functions.https.HttpsError | undefined => {
    try {
      handleError({
        ...defaultErrorResp,
        ...errorRespOverride,
      });
    } catch (e: any) {
      return e;
    }
    return undefined;
  };

  it('throws an error of type `HttpsError`', () => {
    const err = testHandleError();
    expect(err?.message).not.toBeUndefined();
    expect(err?.message).toBe('404 Not Found');
    expect(err?.code).toBe('internal');
    expect(err?.httpErrorCode?.status).toBe(500);
    expect(err?.httpErrorCode?.canonicalName).toBe('INTERNAL');
    expect(err?.details).toBe(errDetails);
  });

  it('falls back to a stringified version of `ErrorResp` if a message is not given', () => {
    const err = testHandleError({ message: undefined });
    expect(err?.message).toBe(
      'An unknown error occurred: {"statusCode":"internal","data":{"error":"The requested URL /events/xml/PAAQAsdftom.xml was not found on this server."}}'
    );
  });

  it('falls back to the `internal` status if a `statusCode` is not given', () => {
    const err = testHandleError({ statusCode: undefined });
    expect(err?.code).toBe('internal');
  });
});

describe('fetchXMLDocument', () => {
  const successfulData = getValidAtomFeed();

  afterEach(() => {
    mockAxios.reset();
  });

  /** `testFetchXMLDocument` is a test-only helper that returns an object rather than a Promise. */
  const testFetchXMLDocument = async (urlArg: string) =>
    fetchXMLDocument(urlArg)
      .then((xmlDoc) => ({
        xmlDoc,
        err: undefined,
      }))
      .catch((err) => ({
        xmlDoc: undefined,
        err,
      }));

  it('should return a rejected Promise if a URL argument is not given', async () => {
    const { xmlDoc, err } = await testFetchXMLDocument('');
    expect(xmlDoc).toBeUndefined();
    expect(err?.message).toBe('unable to fetch XML document: no URL argument given');
  });

  it('should return a rejected Promise if the response status is not 200', async () => {
    const mockResp: Partial<AxiosResponse> = {
      status: 404,
      statusText: 'Not found',
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    const { xmlDoc, err } = await testFetchXMLDocument('https://www.not-a-real-url.com');
    expect(xmlDoc).toBeUndefined();
    expect(err?.message).toBe("unable to fetch XML document: received status '404' (Not found)");
  });

  it('should return a rejected Promise if the response `data` is not received', async () => {
    const mockResp: Partial<AxiosResponse> = {
      status: 200,
      data: undefined,
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    const { xmlDoc, err } = await testFetchXMLDocument(NTWC_TSUNAMI_FEED_URL);
    expect(xmlDoc).toBeUndefined();
    expect(err?.message).toBe('unable to fetch XML document: no data received');
  });

  it('should return a Promise with an XML document as the resolved value', async () => {
    const mockResp = {
      status: 200,
      data: successfulData,
    };
    mockAxios.get.mockResolvedValueOnce(mockResp);

    const { xmlDoc, err } = await testFetchXMLDocument(NTWC_TSUNAMI_FEED_URL);
    expect(err).toBeUndefined();
    expect(xmlDoc).toBe(successfulData);
  });
});
