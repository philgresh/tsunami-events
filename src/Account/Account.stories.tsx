import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import Account from '.';

export default {
  title: 'Account',
  component: Account,
  argTypes: {},
} as ComponentMeta<typeof Account>;

const Template: ComponentStory<typeof Account> = (args) => <Account {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
