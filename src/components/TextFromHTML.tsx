import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/system';

const createHTML = (html: string) => ({ __html: html });

/**
 * `TextFromHTML` returns a div with a white background and a given HTML string injected.
 */
const TextFromHTML = ({ html }: { html: string }) => {
  const theme = useTheme();
  return (
    <Box
      dangerouslySetInnerHTML={createHTML(html)}
      sx={{
        background: theme.palette.common.white,
        padding: 2,
      }}
    />
  );
};

/** Force props equality instead of reading through the whole HTML string looking for a difference each time. */
const propsAreEqual = () => true;

const memoizedTextFromHTML = React.memo(TextFromHTML, propsAreEqual);
export default memoizedTextFromHTML;
