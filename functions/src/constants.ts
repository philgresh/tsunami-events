import { X2jOptionsOptional } from 'fast-xml-parser';

export const CRON_FREQUENCY = 'every 5 minutes';
export const NTWC_TSUNAMI_FEED_URL = 'https://www.tsunami.gov/events/xml/PAAQAtom.xml';
export enum Role {
  Admin = 'admin',
  User = 'user',
}

const feedAlwaysArray = new Set(['feed.entry', 'feed.entry.link']);
export const FEED_PARSER_OPTIONS: X2jOptionsOptional = {
  ignoreAttributes: false,
  /* jest ignore next */
  isArray: (_name, jpath) => feedAlwaysArray.has(jpath),
  /** `transformTagName` is needed for Atom feed tags `geo:long` and `geo:lat` */
  transformTagName: (tagname: string) => {
    if (tagname.includes(':')) return tagname.split(':').join('');
    return tagname;
  },
};
