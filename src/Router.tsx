import React, { Suspense, lazy, memo } from 'react';
import type { ReactNode } from 'react';
import Container from '@mui/material/Container';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter, Navigate, Outlet, Routes, Route } from 'react-router-dom';
import { NavPath, NAVBAR_HEIGHT } from './constants';
import Landing from './Landing';
import Navbar, { Loading } from './Nav';

const Signin = lazy(() => import('./auth/Signin'));
const Account = lazy(() => import('./Account'));
const SMSToS = lazy(() => import('./components/SMSToS'));

const ProtectedRoute = memo(
  ({
    isAllowed,
    redirectPath = NavPath.Landing,
    children,
  }: {
    isAllowed: boolean;
    children?: ReactNode;
    redirectPath?: string;
  }) => {
    if (!isAllowed) {
      return <Navigate to={redirectPath} replace />;
    }

    return <>{children ? children : <Outlet />}</>;
  },
  (prevProps, nextProps) => prevProps.isAllowed === nextProps.isAllowed
);

const Router = () => {
  const [user] = useAuthState(getAuth());
  return (
    <BrowserRouter>
      <Navbar />
      <Container maxWidth="md" sx={{ position: 'fixed', top: NAVBAR_HEIGHT }} component="main">
        <Routes>
          <Route path={NavPath.Landing} element={<Landing />} />
          <Route
            path={NavPath.Account}
            element={
              <ProtectedRoute isAllowed={!!user} redirectPath={NavPath.SignIn}>
                <Suspense fallback={<Loading />}>
                  <Account user={user!} />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path={NavPath.SignIn}
            element={
              <Suspense fallback={<Loading />}>
                <Signin />
              </Suspense>
            }
          />
          <Route
            path={NavPath.SMSToS}
            element={
              <Suspense fallback={<Loading />}>
                <SMSToS />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <main style={{ padding: '1rem' }}>
                <p>There's nothing here!</p>
              </main>
            }
          />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default Router;
