import React from 'react';
import ReactHelmet from 'react-helmet';
import { privacyPolicyHTML, privacyPolicyStyles } from './policies';

const createHTML = () => ({ __html: privacyPolicyHTML });

const PrivacyTerms = () => (
  <div>
    <ReactHelmet>
      <title>Privacy Policy</title>
      <style type="text/css">{privacyPolicyStyles}</style>
    </ReactHelmet>
    <div dangerouslySetInnerHTML={createHTML()} />
  </div>
);

export default React.memo(PrivacyTerms);
