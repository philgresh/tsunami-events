import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import CopyrightTOSComponent from '../Footer/CopyrightTOS';

export default {
  title: 'Landing/Footer/CopyrightTOS',
  component: CopyrightTOSComponent,
  argTypes: {},
} as ComponentMeta<typeof CopyrightTOSComponent>;

const Template: ComponentStory<typeof CopyrightTOSComponent> = () => <CopyrightTOSComponent />;

export const CopyrightTOS = Template.bind({});
