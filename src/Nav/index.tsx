import React from 'react';
import { Link } from 'react-router-dom';

type NavProps = {};

const Nav = (props: NavProps) => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/events">Events</Link>
    </nav>
  );
};

export default Nav;
