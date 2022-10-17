import React from 'react';
import { Box } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import LandingComponent from '..';

export default {
  title: 'Landing',
  component: LandingComponent,
  argTypes: {},
} as ComponentMeta<typeof LandingComponent>;

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

const Template: ComponentStory<typeof LandingComponent> = () => (
  <Background>
    <LandingComponent />
  </Background>
);

export const Landing = Template.bind({});
