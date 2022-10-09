import React from 'react';
import { Box } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '..';
import { ThemeWrapper } from '../../../.storybook/preview';

export default {
  title: 'Landing',
  component: Landing,
  argTypes: {},
} as ComponentMeta<typeof Landing>;

const Background = (props: any) => {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
      }}
      id="storybook-background"
    >
      {props.children}
    </Box>
  );
};

const Template: ComponentStory<typeof Landing> = () => (
  <ThemeWrapper>
    <MemoryRouter initialEntries={['/']}>
      <Background>
        <Landing />
      </Background>
    </MemoryRouter>
  </ThemeWrapper>
);

export const Primary = Template.bind({});
