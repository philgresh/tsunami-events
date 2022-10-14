import React from 'react';
import { Box } from '@mui/material';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import LandingComponent from '..';
import { ThemeWrapper } from '../../../.storybook/preview';

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
  <ThemeWrapper>
    <MemoryRouter initialEntries={['/']}>
      <Background>
        <LandingComponent />
      </Background>
    </MemoryRouter>
  </ThemeWrapper>
);

export const Landing = Template.bind({});
