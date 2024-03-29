import axios from 'axios';
import * as functions from 'firebase-functions';
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
  const errMsg = errorResp?.message ?? `An unknown error occurred: ${JSON.stringify(errorResp)}`;
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
      message: `unable to fetch XML document: ${err?.message}`,
      statusCode: err?.statusCode ?? 'internal',
      data: err,
      ...err,
    });
  }
};

/**
 * `retryOperation` is a recursive function that attempts to complete a given `operation`.
 * If it's not resolved, we retry the `operation` up to `maxRetries` times with a given `delayMs`.
 * @link https://codesandbox.io/s/l4jq4?file=/src/index.ts
 */
export const retryOperation = <T>(
  operation: () => Promise<T>,
  delayMs: number,
  maxRetries: number,
  currentRetry = 0
): Promise<T> => {
  return new Promise((resolve, reject) => {
    operation()
      .then((success) => resolve(success))
      .catch(() => {
        setTimeout(() => {
          if (currentRetry === maxRetries) {
            return reject('maximum retries exceeded');
          }
          retryOperation(operation, delayMs, maxRetries, ++currentRetry).then((success) => resolve(success));
        }, delayMs);
      });
  });
};
