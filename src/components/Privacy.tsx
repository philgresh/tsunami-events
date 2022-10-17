import React from 'react';
import ReactHelmet from 'react-helmet';
import { termlyHTML, termlyStyles } from './termlyPrivacyPolicy';

const createHTML = () => ({ __html: termlyHTML });

const PrivacyTerms = () => (
  <div>
    <ReactHelmet>
      <title>Privacy Policy</title>
      <style type="text/css">{termlyStyles}</style>
    </ReactHelmet>
    <div dangerouslySetInnerHTML={createHTML()} />
  </div>
);

export default React.memo(PrivacyTerms);
