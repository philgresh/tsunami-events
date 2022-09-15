import { XMLParser } from 'fast-xml-parser';
import * as functions from 'firebase-functions';
import { FEED_PARSER_OPTIONS } from './constants';
import { Alert, Event } from './models';
import { fetchXMLDocument, getLinkForCapDocument, handleError } from './utils';
import type { DBAlert } from './models';
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
    feedID: (feedEvent?.id ?? '').replace('urn:uuid:', ''),
    entries: [],
    updated: feedEvent.updated ? new Date(feedEvent.updated) : new Date(),
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

export type FetchAndParseEventResult = {
  id: string;
  alerts: DBAlert[];
};

/**
 * `fetchAndParseEvent` attempts to fetch and parse an XML document and do the following:
 *  - Check to see if we have already seen each entry in the current feed event.
 *  - Handle the associated CAP XML document if we have not already seen an entry.
 */
export const fetchAndParseEvent = async (url: string, urlTitle?: string): Promise<FetchAndParseEventResult> => {
  if (!url) {
    return handleError({
      message: `Unable to fetch and parse event '${urlTitle}': no URL given`,
      statusCode: 'internal',
      data: { url, urlTitle },
    });
  }

  let parsedAtomFeed: ParsedAtomFeed;
  try {
    const atomFeed = await fetchXMLDocument(url);
    parsedAtomFeed = await parseAtomFeed(atomFeed);
  } catch (err: any) {
    return handleError({
      message: `Unable to parse ${urlTitle}: ${err?.message}`,
      statusCode: 'internal',
      data: err,
    });
  }

  if (!parsedAtomFeed.feedID)
    return handleError({
      message: `Error on fetchAndParseEvent: given Atom feed was not parsed correctly`,
      statusCode: 'invalid-argument',
      data: { url, parsedAtomFeed },
    });
  const event = new Event({ id: parsedAtomFeed.feedID, updated: parsedAtomFeed.updated });

  await event.create().catch((err) => {
    return handleError({
      message: `Unable to add Event entry to database: ${err}`,
      statusCode: 'internal',
      data: { event, err },
    });
  });

  // TODO: Use `allSettled` instead of `all` to not block on network errors, etc.
  const createdAlerts = await Promise.all(
    parsedAtomFeed.entries.map((entry) =>
      fetchXMLDocument(entry.capXMLURL)
        .then((alertDoc) => Alert.fromXML(alertDoc, event.id, entry.capXMLURL))
        .then((alert) => alert.create())
        .catch((err) => {
          return handleError({
            message: `Error on fetchAndParseEvent with capXMLURL '${entry.capXMLURL}': ${err}`,
            statusCode: 'internal',
            data: err,
          });
        })
    )
  );

  event.alertIDs = createdAlerts.map((alert) => alert.identifier);
  return event
    .updateAlerts()
    .then((updatedEvent) => {
      const dbEvent = updatedEvent.toDB();
      return Promise.resolve({
        id: dbEvent.id,
        alerts: createdAlerts.map((alert) => alert.toDB()),
      });
    })
    .catch((err) => {
      return handleError({
        message: `Unable to add Event entry to database: ${err}`,
        statusCode: 'internal',
        data: { event, err },
      });
    });
};
