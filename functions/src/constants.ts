import { X2jOptionsOptional } from 'fast-xml-parser';

export const NTWC_TSUNAMI_FEED_URL = 'https://www.tsunami.gov/events/xml/PAAQAtom.xml';
export const GENERIC_ERROR_MSG = 'Error trying to fetch or parse the XML document.';

const feedAlwaysArray = new Set(['feed.entry', 'feed.entry.link']);
export const FEED_PARSER_OPTIONS: X2jOptionsOptional = {
  ignoreAttributes: false,
  /* jest ignore next */
  isArray: (_name, jpath) => feedAlwaysArray.has(jpath),
};
