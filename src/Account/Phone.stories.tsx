import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AddOrEditPhone } from './Phone';
import type { AddOrEditPhoneProps } from './Phone';

export default {
  title: 'Account/Phone/Edit',
  component: AddOrEditPhone,
  argTypes: {},
} as ComponentMeta<typeof AddOrEditPhone>;

const defaultHandleChange = (phoneNumber: string) => {
  console.log({ phoneNumber });
};

const Template: ComponentStory<typeof AddOrEditPhone> = (args: Partial<AddOrEditPhoneProps>) => (
  <AddOrEditPhone onChange={defaultHandleChange} {...args} />
);

export const NoPhoneNumber = Template.bind({});
NoPhoneNumber.args = {
  onChange: defaultHandleChange,
};

export const WithPhoneNumber = Template.bind({});
WithPhoneNumber.args = {
  phoneNumber: '+14158675309',
};

export const WithPhoneNumberMX = Template.bind({});
WithPhoneNumberMX.args = {
  phoneNumber: '+526648675309',
};

export const WithError = Template.bind({});
WithError.args = {
  phoneNumber: '+52664867530',
  error: 'Invalid phone number',
};
