import '@testing-library/jest-dom';
import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import sinon from 'sinon';

const app = initializeApp({
  projectId: `demo-${process.env.REACT_APP_FIREBASE_PROJECT_ID}`,
  appId: `demo-${process.env.REACT_APP_FIREBASE_APP_ID}`,
});

const functions = getFunctions(app);
connectFunctionsEmulator(functions, 'localhost', 5001);

afterEach(() => {
  // Restore the default sandbox here
  sinon.restore();
});
