import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ToSComponent from './ToS';

export default {
  title: 'TOS/Terms of Service',
  component: ToSComponent,
  argTypes: {},
} as ComponentMeta<typeof ToSComponent>;

const Template: ComponentStory<typeof ToSComponent> = () => <ToSComponent />;

export const TermsOfService = Template.bind({});
