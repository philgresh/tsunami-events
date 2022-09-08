import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AddPhone } from '../AddPhone';
import type { AddPhoneProps } from '../AddPhone';

export default {
  title: 'Account/Phone/Edit',
  component: AddPhone,
  argTypes: {},
} as ComponentMeta<typeof AddPhone>;

const defaultHandleChange = (phoneNumber: string) => {
  console.log({ phoneNumber });
};

// const Template: ComponentStory<typeof AddPhone> = (args: Partial<AddPhoneProps>) => (
//   <AddPhone onChange={defaultHandleChange} {...args} />
// );

// export const NoPhoneNumber = Template.bind({});
// NoPhoneNumber.args = {
//   onChange: defaultHandleChange,
// };

// export const WithPhoneNumber = Template.bind({});
// WithPhoneNumber.args = {
//   phoneNumber: '+14158675309',
// };

// export const WithPhoneNumberMX = Template.bind({});
// WithPhoneNumberMX.args = {
//   phoneNumber: '+526648675309',
// };

// export const WithError = Template.bind({});
// WithError.args = {
//   phoneNumber: '+52664867530',
//   error: 'Invalid phone number',
// };
