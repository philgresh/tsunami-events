import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { alertsConfig } from './alerts';

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: true }));
alertsConfig(app);

export const api = functions.https.onRequest(app);
