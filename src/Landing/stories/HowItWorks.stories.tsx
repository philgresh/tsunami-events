import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ThemeWrapper } from '../../../.storybook/preview';
import HowItWorks from '../HowItWorks';

export default {
  title: 'Landing/HowItWorks',
  component: HowItWorks,
  argTypes: {},
} as ComponentMeta<typeof HowItWorks>;

const Template: ComponentStory<typeof HowItWorks> = () => (
  <ThemeWrapper>
    <HowItWorks />
  </ThemeWrapper>
);

export const Primary = Template.bind({});
