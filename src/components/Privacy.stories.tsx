import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import PrivacyComponent from './Privacy';

export default {
  title: 'TOS/Privacy',
  component: PrivacyComponent,
  argTypes: {},
} as ComponentMeta<typeof PrivacyComponent>;

const Template: ComponentStory<typeof PrivacyComponent> = () => <PrivacyComponent />;

export const Privacy = Template.bind({});
