import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { getAuth } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { NavPath } from '../constants';

const StyledSignoutButton = styled.button`
  cursor: pointer;
  color: blue;
  text-decoration: underline;
  border: none;
`;

/** `Nav` is the main Navbar of the app. */
const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(getAuth());

  const handleSignOut = async () => {
    await getAuth()
      .signOut()
      .then(() => {
        navigate('/');
      });
  };
  if (location.pathname === NavPath.SignIn) return null;

  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to={NavPath.Events}>Events</Link>
      {user ? (
        <>
          <Link to={NavPath.Account}>Account</Link>
          <StyledSignoutButton onClick={handleSignOut}>Sign Out</StyledSignoutButton>
        </>
      ) : (
        <Link to={NavPath.SignIn}>Sign In</Link>
      )}
    </nav>
  );
};

export default Nav;
