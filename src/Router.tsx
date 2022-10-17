import React, { Suspense, lazy, memo } from 'react';
import type { ReactNode } from 'react';
import Container from '@mui/material/Container';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { BrowserRouter, Navigate, Outlet, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { NavPath, NAVBAR_HEIGHT } from './constants';
import Landing from './Landing';
import Navbar, { Loading } from './Nav';
import type { Breakpoint } from '@mui/material';

const Signin = lazy(() => import('./auth/Signin'));
const Account = lazy(() => import('./Account'));
const PrivacyPolicy = lazy(() => import('./components/Privacy'));
const SMSToS = lazy(() => import('./components/SMSToS'));

const StyledMain = styled.main`
  position: absolute;
  top: ${NAVBAR_HEIGHT};
  left: 0;
  width: 100%;
`;

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

  const ContainerizedRoute = ({ maxWidth, children }: { maxWidth?: Breakpoint; children?: React.ReactNode }) => (
    <Container maxWidth={maxWidth} sx={{ position: 'absolute', top: NAVBAR_HEIGHT }} component="main">
      {children}
    </Container>
  );

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path={NavPath.Landing}
          element={
            <StyledMain>
              <Landing />
            </StyledMain>
          }
        />
        <Route
          path={NavPath.Account}
          element={
            <ProtectedRoute isAllowed={!!user} redirectPath={NavPath.SignIn}>
              <Suspense fallback={<Loading />}>
                <ContainerizedRoute maxWidth="md">
                  <Account user={user!} />
                </ContainerizedRoute>
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
              <ContainerizedRoute>
                <SMSToS />
              </ContainerizedRoute>
            </Suspense>
          }
        />
        <Route
          path={NavPath.PrivacyPolicy}
          element={
            <Suspense fallback={<Loading />}>
              <ContainerizedRoute>
                <PrivacyPolicy />
              </ContainerizedRoute>
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <ContainerizedRoute>
              <p>There's nothing here!</p>
            </ContainerizedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
