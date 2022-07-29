import { CAP_1_2 } from 'cap-ts';
import { XMLParser } from 'fast-xml-parser';
import * as functions from 'firebase-functions';
import { FEED_PARSER_OPTIONS, NTWC_TSUNAMI_FEED_URL } from './constants';
import { fetchXMLDocument, getLinkForCapDocument, handleError } from './utils';
import type { AtomFeed, Entry, ParsedAtomFeed } from './types';

const feedParser = new XMLParser(FEED_PARSER_OPTIONS);

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
    const errMsg = `unable to parse feed XML document: ${err?.message ?? JSON.stringify(err)}`;
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
 * `handleAlert` parses the CAP Alert XML document and checks the DB for existing entries.
 */
export const handleAlert = async (alertDoc: string) => {
  try {
    const alert = CAP_1_2.Alert.fromXML(alertDoc);
    functions.logger.log(`Alert ID '${alert?.identifier ?? 'no-identifier'}' successfully parsed`);
    // TODO: Check the DB for existing alerts.
    //       If all have been handled already, return.
    //       Else, add the alert to the DB
    //       and dispatch a message to the appropriate pub-sub topic(s).
    return Promise.resolve();
  } catch (err: any) {
    const message = `unable to parse alert XML document: ${err?.message ?? JSON.stringify(err)}`;
    return handleError({
      message,
      statusCode: 'internal',
      data: err,
    });
  }
};

/**
 * `fetchAndParseLatestEvents` attempts to fetch and parse the NTWC Tsunami Atom Feed XML document and do the following:
 *  - [TODO] Check to see if we have already seen each entry in the current feed event.
 *  - If we  the associated CAP XML document if we have not already seen an entry.
 *  - Handle the CAP XML document
 */
export const fetchAndParseLatestEvents = async (): Promise<any> => {
  let parsedAtomFeed: ParsedAtomFeed;
  try {
    const atomFeed = await fetchXMLDocument(NTWC_TSUNAMI_FEED_URL);
    parsedAtomFeed = await parseAtomFeed(atomFeed);
  } catch (err: any) {
    return handleError({
      message: `Unable to parse NTWC Tsunami Atom feed: ${err?.message ?? JSON.stringify(err)}`,
      statusCode: 'internal',
      data: err,
    });
  }

  functions.logger.log('parsedAtomFeed', parsedAtomFeed);

  let alertDocuments: Array<string> = [];

  // Use `allSettled` instead of `all` to not block on network errors, etc.
  const results = await Promise.allSettled(parsedAtomFeed.entries.map((entry) => fetchXMLDocument(entry.capXMLURL)));
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      alertDocuments.push(result.value);
    } else {
      const err = result.reason;
      const message = `Unable to fetch NTWC Tsunami Atom feed: unable to fetch XML document: ${
        err?.message ?? JSON.stringify(err)
      }`;
      handleError({
        message,
        statusCode: 'internal',
        data: err,
      });
    }
  });

  return Promise.allSettled(
    alertDocuments.map((alertDoc) =>
      handleAlert(alertDoc).catch((err) => {
        const message = `Unable to handle alert: ${err?.message ?? JSON.stringify(err)}`;
        return handleError({
          message,
          statusCode: 'internal',
          data: err,
        });
      })
    )
  );
};
