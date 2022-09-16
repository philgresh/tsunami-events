import * as functions from 'firebase-functions';
import { Role } from '../../constants';
import Alert from '../../models/Alert';
import { fetchXMLDocument } from '../../utils';
import { isAuthenticated, isAuthorized } from './auth';
import type { Application, Request, Response } from 'express';

/**
 * `manuallyAddAlerts` allows admin to manually add Alerts from a URL.
 * Usage: POST /manuallyAddAlerts
 * @body `{ "alertURLs": string[] }`
 * @returns `
 * {
 *    successfulAlerts: {
 *      alertID: string;
 *      alertURL: string;
 *    }[],
 *    unsuccessfulAlerts: {
 *       alertURL: string;
 *       reason: string;
 *    }[]
 * }
 * `
 */
const manuallyAddAlerts = async (req: Request, res: Response) => {
  if (!req?.body?.['alertURLs']?.length) {
    res.status(400).send('A request body is required');
    return Promise.reject();
  }

  const alertURLs: string[] = req.body.alertURLs;

  functions.logger.log('Received alert URLs', alertURLs);

  const alertPromises: Promise<Alert>[] = [];

  for (const alertURL of alertURLs) {
    try {
      // Validate each alertURL before trying to use it
      const url = new URL(alertURL);
      const alertXML = await fetchXMLDocument(url.toString());
      const alert = await Alert.fromXML(alertXML, { url: url.toString(), manuallyAdded: true });
      alertPromises.push(alert.create());
    } catch (e: any) {
      const errMessage = `Unable to manually add alert '${alertURL}': ${e?.message ?? e}`;
      alertPromises.push(Promise.reject(errMessage));
    }
  }

  return Promise.allSettled(alertPromises)
    .then((results) => {
      const successfulAlerts: {
        alertID: string;
        alertURL: string;
      }[] = [];
      const unsuccessfulAlerts: {
        alertURL: string;
        reason: string;
      }[] = [];
      results.forEach((result, i) => {
        const alertURL = alertURLs[i];
        if (result.status === 'fulfilled') {
          successfulAlerts.push({
            alertURL,
            alertID: result.value.identifier,
          });
        } else {
          unsuccessfulAlerts.push({ alertURL, reason: `${result.reason}` });
        }
      });

      const resp = { successfulAlerts, unsuccessfulAlerts };

      functions.logger.log('Manually added alerts', resp);
      res.status(200).send(resp);
    })
    .catch((err) => {
      const errMsg = `Error manually adding alerts: ${err}`;
      functions.logger.error(errMsg);
      res.status(500).send(errMsg);
    });
};

export function alertsConfig(app: Application) {
  app.post('/alerts', isAuthenticated, isAuthorized({ hasRole: [Role.Admin] }), manuallyAddAlerts);
}
