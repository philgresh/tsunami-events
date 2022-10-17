import React from 'react';
import ReactHelmet from 'react-helmet';
import { tosHTML } from './policies';

const createHTML = () => ({ __html: tosHTML });

const TOS = () => (
  <div>
    <ReactHelmet>
      <title>Terms of Use</title>
    </ReactHelmet>
    <div dangerouslySetInnerHTML={createHTML()} />
  </div>
);

export default React.memo(TOS);
