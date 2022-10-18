import React from 'react';
import ReactHelmet from 'react-helmet';
import { tosHTML } from './policies';
import TextFromHTML from './TextFromHTML';

/**
 * `TOS` displays the terms of service within a memoized `TextFromHTML` component.
 */
const TOS = () => (
  <div>
    <ReactHelmet>
      <title>Terms of Use</title>
    </ReactHelmet>
    <TextFromHTML html={tosHTML} />
  </div>
);

export default TOS;
