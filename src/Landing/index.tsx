import React from 'react';

const Footer = React.lazy(() => import('./Footer'));
const Hero = React.lazy(() => import('./Hero'));
const HowItWorks = React.lazy(() => import('./HowItWorks'));

const Landing = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Footer />
    </>
  );
};

export default Landing;
