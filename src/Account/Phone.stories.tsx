import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Phone from './Phone';

export default {
  title: 'Account/Phone',
  component: Phone,
  argTypes: {},
} as ComponentMeta<typeof Phone>;

const Template: ComponentStory<typeof Phone> = (args) => <Phone {...args} />;

export const Typical = Template.bind({});
