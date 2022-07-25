import type { https } from 'firebase-functions';

type XMLLink = {
  '@_type': string;
  '@_rel': string;
  '@_title': string;
  '@_href': string;
};

export type Entry = {
  id: string;
  title: string;
  updated: string;
  /** `capXMLURL` is the parsed link for the CAP XML document */
  capXMLURL: string;
  /** `links` is the array of parsed links */
  link?: Array<XMLLink>;
};

export type FeedEvent = {
  id: string;
  title?: string;
  updated?: string;
  link?: XMLLink;
  entry?: Array<Entry>;
};

export type AtomFeed = {
  feed: FeedEvent;
};

export type ErrorResp = {
  statusCode?: https.FunctionsErrorCode;
  message?: string;
  data?: any;
};

export type ParsedAtomFeed = {
  parsedFeed: FeedEvent;
  feedID: string;
  entries: Array<Entry>;
};
