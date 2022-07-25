import axios from 'axios';
import { CAP_1_2 } from 'cap-ts';
import { XMLParser, X2jOptionsOptional } from 'fast-xml-parser';
import * as functions from 'firebase-functions';
import type { AtomFeed, Entry, ErrorResp, ParsedAtomFeed } from './types';

const NTWC_TSUNAMI_FEED_URL = 'https://www.tsunami.gov/events/xml/PAAQAtom.xml';
const GENERIC_ERROR_MSG = 'Error trying to fetch or parse the XML document.';
const feedAlwaysArray = new Set(['feed.entry', 'feed.entry.link']);
const feedParserOptions: X2jOptionsOptional = {
  ignoreAttributes: false,
  isArray: (_name, jpath) => feedAlwaysArray.has(jpath),
};

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

const handleError = (response: functions.Response, errorResp: ErrorResp): Promise<never> => {
  const errMsg = errorResp?.message ?? GENERIC_ERROR_MSG;
  functions.logger.error(errMsg, errorResp ?? {});
  response.status(errorResp.statusCode ?? 500).send(errMsg);
  return Promise.reject(errMsg);
};

/** `fetchXMLDocument` fetches an XML document given a URL. */
const fetchXMLDocument = async (response: functions.Response, url: string): Promise<string> => {
  try {
    const resp = await axios.get(url, {
      responseType: 'text',
      responseEncoding: 'utf8',
    });

    if (resp?.status !== 200)
      return handleError(response, {
        message: `Unable to fetch NTWC Tsunami feed: received status '${resp?.status}' (${resp?.statusText})`,
        statusCode: 500,
        data: resp,
      });

    if (!resp?.data)
      return handleError(response, {
        message: 'Unable to fetch NTWC Tsunami feed: no data received',
        statusCode: 500,
        data: resp,
      });

    functions.logger.log(`XML successfully fetched from ${url}`);
    return Promise.resolve(resp.data);
  } catch (err) {
    return handleError(response, {
      message: `Unable to fetch NTWC Tsunami feed: ${err}`,
      statusCode: 500,
      data: err,
    });
  }
};

/**
 * `parseAtomFeed` parses the RSS Atom feed to capture each event's ID and feed entries.
 */
const parseAtomFeed = async (xmlStr: string): Promise<ParsedAtomFeed> => {
  try {
    const parser = new XMLParser(feedParserOptions);
    const atomFeed: AtomFeed = parser.parse(xmlStr);
    const feedEvent = atomFeed.feed;

    const parsedAtomFeed: ParsedAtomFeed = {
      feedID: feedEvent.id,
      entries: [],
      parsedFeed: feedEvent,
    };

    (feedEvent?.entry ?? []).forEach((entry) => {
      const entryCopy: Entry = { ...entry, capXMLURL: getLinkForCapDocument(entry) };

      parsedAtomFeed.entries.push(entryCopy);
      functions.logger.log(`Successfully parsed entry for feed ID:'${feedEvent.id}'`, { entry: entryCopy });
    });

    return Promise.resolve(parsedAtomFeed);
  } catch (err: any) {
    const errMsg = `Unable to fetch NTWC Tsunami feed: unable to parse feed XML document: ${err}`;
    return Promise.reject({
      message: errMsg,
      statusCode: 500,
      data: err,
    });
  }
};

/**
 * `fetchAndParseLatestEvents` attempts to fetch and parse the NTWC Tsunami Atom Feed XML document and do the following:
 *  - [TODO] Check to see if we have already seen each entry in the current feed event.
 *  - Parse the associated CAP XML document if we have not already seen an entry.
 *  - [TODO] Persist the event in the Firebase database.
 *  - [TODO] Publish the alert to the appropriate pub/sub topics.
 */
export const fetchAndParseLatestEvents = async (
  _request: functions.https.Request,
  response: functions.Response
): Promise<any> => {
  let parsedAtomFeed: ParsedAtomFeed;
  try {
    const atomFeed = await fetchXMLDocument(response, NTWC_TSUNAMI_FEED_URL);
    parsedAtomFeed = await parseAtomFeed(atomFeed);
  } catch (err: any) {
    return handleError(response, {
      message: `Unable to parse NTWC Tsunami Atom feed: ${err}`,
      statusCode: 500,
      data: err,
    });
  }

  for (const entry of parsedAtomFeed.entries) {
    // TODO: Check the DB for existing entries. If all have been seen already, return.
    try {
      if (!entry.capXMLURL) throw new Error('no parsed CAP XML url');

      const alertStr = await fetchXMLDocument(response, entry.capXMLURL);

      const alert = CAP_1_2.Alert.fromXML(alertStr);
      functions.logger.log(`Alert ID '${alert?.identifier ?? 'no-identifier'}' successfully parsed`);

      return response.send(alert);
    } catch (err: any) {
      const message = `Unable to fetch NTWC Tsunami feed: unable to parse XML document: ${err}`;
      return handleError(response, {
        message,
        statusCode: 500,
        data: err,
      });
    }
  }
};
