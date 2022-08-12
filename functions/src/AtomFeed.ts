import { XMLParser } from 'fast-xml-parser';
import * as functions from 'firebase-functions';
import { FEED_PARSER_OPTIONS, NTWC_TSUNAMI_FEED_URL } from './constants';
import { Event } from './models';
import { fetchXMLDocument, getLinkForCapDocument, handleError } from './utils';
import type { AtomFeed, Entry, ParsedAtomFeed } from './types';
import Alert from './models/Alert';

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
    feedID: (feedEvent?.id ?? '').replace('urn:uuid:', ''),
    entries: [],
  };

  (feedEvent?.entry ?? []).forEach((entry) => {
    const entryCopy: Entry = {
      ...entry,
      capXMLURL: getLinkForCapDocument(entry),
      id: (entry?.id ?? '').replace('urn:uuid:', ''),
    };

    parsedAtomFeed.entries.push(entryCopy);
    functions.logger.log(`Successfully parsed entry for feed ID:'${parsedAtomFeed.feedID}'`);
  });

  return Promise.resolve(parsedAtomFeed);
};

/**
 * `fetchAndParseLatestEvents` attempts to fetch and parse the NTWC Tsunami Atom Feed XML document and do the following:
 *  - [TODO] Check to see if we have already seen each entry in the current feed event.
 *  - Handle the associated CAP XML document if we have not already seen an entry.
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

  const event = new Event(parsedAtomFeed.feedID);

  await event.create().catch((err) => {
    return handleError({
      message: `Unable to add Event entry to database: ${err}`,
      statusCode: 'internal',
      data: { event, err },
    });
  });

  // Use `allSettled` instead of `all` to not block on network errors, etc.
  const createdAlerts = await Promise.all(
    parsedAtomFeed.entries.map((entry) =>
      fetchXMLDocument(entry.capXMLURL)
        .then((alertDoc) => Alert.parseFromXML(alertDoc, event.id))
        .then((alert) => alert.create())
        .catch((err) => {
          return handleError({
            message: `Error on fetchAndParseLatestEvents with capXMLURL '${entry.capXMLURL}': ${err}`,
            statusCode: 'internal',
            data: err,
          });
        })
    )
  );

  event.alertIDs = createdAlerts.map((alert) => alert.identifier);
  return event
    .updateAlerts()
    .then((updatedEvent) =>
      Promise.resolve({
        ...updatedEvent.toDB(),
        alerts: createdAlerts.map((alert) => alert.toDB()),
      })
    )
    .catch((err) => {
      return handleError({
        message: `Unable to add Event entry to database: ${err}`,
        statusCode: 'internal',
        data: { event, err },
      });
    });
};
