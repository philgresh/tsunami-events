import axios from 'axios';
import * as functions from 'firebase-functions';
import { GENERIC_ERROR_MSG } from './constants';
import type { Entry, ErrorResp } from './types';

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
      message: 'unable to fetch XML document: no URL argument given',
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
      message: `unable to fetch XML document: ${err?.message ?? JSON.stringify(err)}`,
      statusCode: err?.statusCode ?? 'internal',
      data: err,
      ...err,
    });
  }
};
