import * as functions from 'firebase-functions';
import { getLinkForCapDocument, handleError } from '../src/CAPdocument';
import type { Entry, ErrorResp } from '../src/types';

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

  const testHandleError = (errorRespOverride?: Partial<ErrorResp>): functions.https.HttpsError | undefined => {
    let error: Error;
    try {
      handleError({
        ...defaultErrorResp,
        ...errorRespOverride,
      });
    } catch (e) {
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

  it('falls back to the `GENERIC_ERROR_MSG` if a message is not given', () => {
    const err = testHandleError({ message: undefined });
    expect(err?.message).toBe('Error trying to fetch or parse the XML document.');
  });

  it('falls back to the `internal` status if a `statusCode` is not given', () => {
    const err = testHandleError({ statusCode: undefined });
    expect(err?.code).toBe('internal');
  });
});
