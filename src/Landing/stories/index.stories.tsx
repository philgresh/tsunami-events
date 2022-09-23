import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Landing from '..';
import { ThemeWrapper } from '../../../.storybook/preview';

export default {
  title: 'Landing',
  component: Landing,
  argTypes: {},
} as ComponentMeta<typeof Landing>;

const Template: ComponentStory<typeof Landing> = () => (
  <ThemeWrapper>
    <Landing />
  </ThemeWrapper>
);

export const Primary = Template.bind({});
