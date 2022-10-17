import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import HowItWorksComponent from '../HowItWorks';

export default {
  title: 'Landing/HowItWorks',
  component: HowItWorksComponent,
  argTypes: {},
} as ComponentMeta<typeof HowItWorksComponent>;

const Template: ComponentStory<typeof HowItWorksComponent> = () => <HowItWorksComponent />;

export const HowItWorks = Template.bind({});
