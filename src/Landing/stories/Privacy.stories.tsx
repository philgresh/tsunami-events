import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { ThemeWrapper } from '../../../.storybook/preview';
import PrivacyComponent from '../../components/Privacy';

export default {
  title: 'TOS/Privacy',
  component: PrivacyComponent,
  argTypes: {},
} as ComponentMeta<typeof PrivacyComponent>;

const Template: ComponentStory<typeof PrivacyComponent> = () => (
  <ThemeWrapper>
    <PrivacyComponent />
  </ThemeWrapper>
);

export const Privacy = Template.bind({});
