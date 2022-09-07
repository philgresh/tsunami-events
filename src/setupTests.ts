import 'dotenv';
import fs from 'fs';
import '@testing-library/jest-dom';
import { initializeApp } from 'firebase/app';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';

const databaseRules = JSON.parse(fs.readFileSync(__dirname + '/../database.rules.json', 'utf-8'));
const demoProjectID = `demo-${process.env.REACT_APP_FIREBASE_PROJECT_ID}`;

/** `initializeFirebaseTestEnv` is a test-only util to be used within `beforeAll` and the like */
export const initializeFirebaseTestEnv = async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: demoProjectID,
    database: {
      rules: databaseRules,
      port: 9000,
      host: '127.0.0.1',
    },
  });
  initializeApp({
    projectId: demoProjectID,
  });
  return testEnv;
};

beforeAll(initializeFirebaseTestEnv);

export type { RulesTestEnvironment };
