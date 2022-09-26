import React from 'react';
import { Box, useTheme } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Landing from '..';
import { ThemeWrapper } from '../../../.storybook/preview';

export default {
  title: 'Landing',
  component: Landing,
  argTypes: {},
} as ComponentMeta<typeof Landing>;

const Background = (props: any) => {
  const theme = useTheme();
  return (
    <Box
      style={{
        backgroundColor: theme.palette.background.paper,
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
      }}
    >
      {props.children}
    </Box>
  );
};

const Template: ComponentStory<typeof Landing> = () => (
  <ThemeWrapper>
    <Background>
      <Landing />
    </Background>
  </ThemeWrapper>
);

export const Primary = Template.bind({});
