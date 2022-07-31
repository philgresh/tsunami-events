import { XMLParser } from 'fast-xml-parser';
import * as functions from 'firebase-functions';
import { handleAlert } from './CAPDocument';
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
    return Promise.reject({
      message: `unable to parse feed XML document: ${err?.message}`,
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
      message: `Unable to parse NTWC Tsunami Atom feed: ${err?.message}`,
      statusCode: 'internal',
      data: err,
    });
  }

  functions.logger.log('parsedAtomFeed', parsedAtomFeed);

  // Note: Use a Map to take advantage of built-in de-duping
  const alertDocuments = new Map<string, string>();

  // Use `allSettled` instead of `all` to not block on network errors, etc.
  await Promise.all(
    parsedAtomFeed.entries.map((entry) =>
      fetchXMLDocument(entry.capXMLURL)
        .then((alertDoc) => alertDocuments.set(entry.capXMLURL, alertDoc))
        .catch((err) => {
          return handleError({
            message: `Unable to fetch NTWC Tsunami Atom feed: unable to fetch XML document for url \'entry.capXMLURL\': ${err?.message}`,
            statusCode: 'internal',
            data: err,
          });
        })
    )
  );

  const handleAlertsPromises = [];

  for (const [capXMLURL, alertDoc] of alertDocuments) {
    handleAlertsPromises.push(
      handleAlert(alertDoc).catch((err) => {
        return handleError({
          message: `Unable to handle alert for url '${capXMLURL}': ${err?.message}`,
          statusCode: 'internal',
          data: err,
        });
      })
    );
  }

  return Promise.all(handleAlertsPromises);
};
