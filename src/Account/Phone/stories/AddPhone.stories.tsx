import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Phone } from '../../../models';
import { AddPhone } from '../components/AddPhone';
import type { AddPhoneProps } from '../components/AddPhone';

export default {
  title: 'Account/Phone/AddPhone',
  component: AddPhone,
  argTypes: {},
} as ComponentMeta<typeof AddPhone>;

const defaultProps: AddPhoneProps = {
  uid: 'abcd-1234',
  setUserPhone: (phone: Phone) => Promise.resolve(),
};

const Template: ComponentStory<typeof AddPhone> = (args) => <AddPhone {...defaultProps} {...args} />;

export const Typical = Template.bind({});
Typical.args = {};
