import type { https } from 'firebase-functions';
import type { Alert as CAP_Alert } from 'cap-ts/dist/node/CAP-1-2';

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
  link?: XMLLink[];
};

export type FeedEvent = {
  id: string;
  title?: string;
  updated?: string;
  link?: XMLLink;
  entry?: Entry[];
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
  feedID: string;
  entries: Entry[];
};

/**
 * Data models
 */

export type Alert = CAP_Alert & {
  jsonURL: string;
};

export type Event = {
  id: string;
  textBulletinURL: string;
  geoLat: number;
  geoLon: number;
  /** `alerts` contains IDs of Alerts saved at the DB's highest level */
  alerts: Array<string>;
};
