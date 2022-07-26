import axios from 'axios';
import { CAP_1_2 } from 'cap-ts';
import { XMLParser } from 'fast-xml-parser';
import * as functions from 'firebase-functions';
import { FEED_PARSER_OPTIONS, NTWC_TSUNAMI_FEED_URL, GENERIC_ERROR_MSG } from './constants';
import type { AtomFeed, Entry, ErrorResp, ParsedAtomFeed } from './types';

const feedParser = new XMLParser(FEED_PARSER_OPTIONS);

/**
 * `getLinkForCapDocument` returns the link to the CAP XML document if it exists on the entry.
 * It returns an empty string if none is found.
 */
export const getLinkForCapDocument = (entry?: Entry): string => {
  for (const link of entry?.link ?? []) {
    if (link?.['@_type'] === 'application/cap+xml') return link?.['@_href'] ?? '';
  }
  return '';
};

/**
 * `handleError` logs a given error message and throws an error that the callable function can catch.
 * @link https://firebase.google.com/docs/functions/callable#handle_errors_on_the_client
 */
export const handleError = (errorResp: ErrorResp) => {
  const errMsg = errorResp?.message ?? GENERIC_ERROR_MSG;
  const errCode = errorResp?.statusCode ?? 'internal';

  functions.logger.error(errMsg, errorResp);

  throw new functions.https.HttpsError(errCode, errMsg, errorResp.data);
};

/**
 * `fetchXMLDocument` fetches an XML document given a URL.
 */
export const fetchXMLDocument = async (url: string): Promise<string> => {
  if (!url)
    return handleError({
      message: 'Unable to fetch XML document: no URL argument given',
      statusCode: 'internal',
    });

  try {
    const resp = await axios.get(url, {
      responseType: 'text',
      responseEncoding: 'utf8',
    });

    if (resp?.status !== 200)
      return handleError({
        message: `received status '${resp?.status}' (${resp?.statusText})`,
        statusCode: 'unavailable',
        data: resp,
      });

    if (!resp?.data)
      return handleError({
        message: 'no data received',
        statusCode: 'unavailable',
        data: resp,
      });

    functions.logger.log(`XML successfully fetched from ${url}`);
    return Promise.resolve(resp.data);
  } catch (err: any) {
    return Promise.reject({
      message: `Unable to fetch XML document: ${err?.message ?? err}`,
      statusCode: err?.statusCode ?? 'internal',
      data: err,
      ...err,
    });
  }
};

/**
 * `parseAtomFeed` parses the RSS Atom feed to capture each event's ID and feed entries.
 */
export const parseAtomFeed = async (xmlStr: string): Promise<ParsedAtomFeed> => {
  if (!xmlStr)
    return Promise.reject({
      message: 'unable to parse feed XML document: no XML document string given',
      statusCode: 500,
    });

  let atomFeed: AtomFeed;

  try {
    atomFeed = feedParser.parse(xmlStr, true);
  } catch (err: any) {
    const errMsg = `unable to parse feed XML document: ${err?.message ?? err}`;
    return Promise.reject({
      message: errMsg,
      statusCode: 500,
      data: err,
    });
  }

  const feedEvent = atomFeed.feed;
  const parsedAtomFeed: ParsedAtomFeed = {
    feedID: feedEvent?.id,
    entries: [],
  };

  (feedEvent?.entry ?? []).forEach((entry) => {
    const entryCopy: Entry = { ...entry, capXMLURL: getLinkForCapDocument(entry) };

    parsedAtomFeed.entries.push(entryCopy);
    functions.logger.log(`Successfully parsed entry for feed ID:'${parsedAtomFeed.feedID}'`, { entry: entryCopy });
  });

  return Promise.resolve(parsedAtomFeed);
};

/**
 * `fetchAndParseLatestEvents` attempts to fetch and parse the NTWC Tsunami Atom Feed XML document and do the following:
 *  - [TODO] Check to see if we have already seen each entry in the current feed event.
 *  - Parse the associated CAP XML document if we have not already seen an entry.
 *  - [TODO] Persist the event in the Firebase database.
 *  - [TODO] Publish the alert to the appropriate pub/sub topics.
 */
export const fetchAndParseLatestEvents = async (): Promise<any> => {
  let parsedAtomFeed: ParsedAtomFeed;
  try {
    const atomFeed = await fetchXMLDocument(NTWC_TSUNAMI_FEED_URL);
    parsedAtomFeed = await parseAtomFeed(atomFeed);
  } catch (err: any) {
    return handleError({
      message: `Unable to parse NTWC Tsunami Atom feed: ${err}`,
      statusCode: 'internal',
      data: err,
    });
  }

  for (const entry of parsedAtomFeed.entries) {
    // TODO: Check the DB for existing entries. If all have been seen already, return.
    try {
      if (!entry.capXMLURL) throw new Error('no parsed CAP XML url');

      const alertStr = await fetchXMLDocument(entry.capXMLURL);

      const alert = CAP_1_2.Alert.fromXML(alertStr);
      functions.logger.log(`Alert ID '${alert?.identifier ?? 'no-identifier'}' successfully parsed`);

      return { alert };
    } catch (err: any) {
      const message = `Unable to fetch NTWC Tsunami feed: unable to parse XML document: ${err}`;
      return handleError({
        message,
        statusCode: 'internal',
        data: err,
      });
    }
  }
};
