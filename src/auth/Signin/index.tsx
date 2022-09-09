import React, { useEffect } from 'react';
import { getAuth, EmailAuthProvider, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import StyledFirebaseAuth from '../StyledFirebaseUI';
import 'firebaseui/dist/firebaseui.css';
import { NavPath } from '../../constants';
import type * as firebaseui from 'firebaseui';

const StyledContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  font-family: sans-serif;
`;

const Login = () => {
  const [user, loading, error] = useAuthState(getAuth());
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (user) navigate(NavPath.Account);
  }, [navigate, user, loading]);

  const config: firebaseui.auth.Config = {
    signInFlow: 'popup',
    signInOptions: [EmailAuthProvider.PROVIDER_ID, GoogleAuthProvider.PROVIDER_ID, GithubAuthProvider.PROVIDER_ID],
    signInSuccessUrl: NavPath.Account,
    siteName: 'Tsunami Events',
    callbacks: {
      signInSuccessWithAuthResult: (_authResult, _redirectUrl) => {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        return true;
      },
    },
    tosUrl: NavPath.SMSToS,
    // TODO:
    privacyPolicyUrl: NavPath.PrivacyPolicy,
  };

  if (error) {
    console.error(error);
    return (
      <div>
        Unexpected error:
        <br />
        <code>{error.message}</code>
        <code>{error.stack}</code>
      </div>
    );
  }

  return (
    <StyledContainer>
      {!user && (
        <div>
          <StyledFirebaseAuth className={'firebaseUi'} uiConfig={config} firebaseAuth={getAuth()} />
        </div>
      )}
    </StyledContainer>
  );
};
export default Login;
