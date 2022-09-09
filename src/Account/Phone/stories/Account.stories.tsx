import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { AccountItems, AccountItem } from '../..';

export default {
  title: 'Account/AccountItems',
  component: AccountItems,
  argTypes: {},
} as ComponentMeta<typeof AccountItems>;

const Template: ComponentStory<typeof AccountItems> = (args) => <AccountItems {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  children: [
    <AccountItem title="First Item">
      <div style={{ background: 'grey', height: '200px' }}>content</div>
    </AccountItem>,
    <AccountItem title="Second Item">
      <div style={{ background: 'pink', height: '200px' }}>content</div>
    </AccountItem>,
  ],
};
