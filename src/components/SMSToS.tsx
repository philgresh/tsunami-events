import React from 'react';
import { Typography } from '@mui/material';

export const SMSToS = () => {
  return (
    <div>
      <Typography variant="h6">SMS Terms of Service</Typography>
      <Typography variant="body2">
        1. Tsunami Events is a website that listens for published tsunami events from governmental and intergovernmental
        sources, and passes along a subset of this information via SMS messages to subscribing participants.
        Participants are able to opt-in and opt-out at any time.
      </Typography>
      <Typography variant="body2">
        2. You can cancel the SMS service at any time. Just text "STOP" to the short code. After you send the SMS
        message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed. After this,
        you will no longer receive SMS messages from us. If you want to join again, just sign up as you did the first
        time and we will start sending SMS messages to you again.
      </Typography>
      <Typography variant="body2">
        3. If you are experiencing issues with the messaging program you can reply with the keyword HELP for more
        assistance, or you can get help directly at phil+tsunami@gresham.dev.
      </Typography>
      <Typography variant="body2">4. Carriers are not liable for delayed or undelivered messages</Typography>
      <Typography variant="body2">
        5. As always, message and data rates may apply for any messages sent to you from us and to us from you. You will
        receive messages as events occur and you are subscribed. If you have any questions about your text plan or data
        plan, it is best to contact your wireless provider.
      </Typography>
    </div>
  );
};

export default React.memo(SMSToS);
