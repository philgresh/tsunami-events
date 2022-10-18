import React from 'react';
import ReactHelmet from 'react-helmet';
import { privacyPolicyHTML, privacyPolicyStyles } from './policies';
import TextFromHTML from './TextFromHTML';

/**
 * `PrivacyTerms` displays the privacy policy within a memoized `TextFromHTML` component.
 */
const PrivacyTerms = () => (
  <div>
    <ReactHelmet>
      <title>Privacy Policy</title>
      <style type="text/css">{privacyPolicyStyles}</style>
    </ReactHelmet>
    <TextFromHTML html={privacyPolicyHTML} />
  </div>
);

export default PrivacyTerms;
