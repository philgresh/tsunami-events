import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter, Navigate, Outlet, Routes, Route } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Container from '@mui/material/Container';
import Navbar, { Loading } from './Nav';
import { NavPath, NAVBAR_HEIGHT } from './constants';
import type { ReactNode } from 'react';

const Signin = lazy(() => import('./auth/Signin'));
const Phone = lazy(() => import('./Account/Phone'));

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
          <Route path="/" element={<div>Home</div>} />
          <Route path={NavPath.Events} element={<div>Events</div>} />
          <Route
            path={NavPath.Phone}
            element={
              <ProtectedRoute isAllowed={!!user} redirectPath={NavPath.SignIn}>
                <Suspense fallback={<Loading />}>
                  <Phone />
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
