import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Routes, Route } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import Events from './Events';
import Home from './Home';
import Navbar from './Nav/Navbar';
import { NavPath } from './constants';

const Signin = React.lazy(() => import('./auth/Signin'));

const ProtectedRoute = React.memo(
  ({
    isAllowed,
    redirectPath = NavPath.Landing,
    children,
  }: {
    isAllowed: boolean;
    children?: React.ReactNode;
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
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path={NavPath.Profile}
          element={
            <ProtectedRoute isAllowed={!!user}>
              <div>Profile</div>
            </ProtectedRoute>
          }
        />
        <Route path={NavPath.Events} element={<Events />} />
        <Route
          path={NavPath.SignIn}
          element={
            <Suspense fallback={<div>Loading...</div>}>
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
    </BrowserRouter>
  );
};

export default Router;
