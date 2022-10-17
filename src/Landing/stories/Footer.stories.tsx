import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import FooterComponent from '../Footer';

export default {
  title: 'Landing/Footer/Footer',
  component: FooterComponent,
  argTypes: {},
} as ComponentMeta<typeof FooterComponent>;

const Template: ComponentStory<typeof FooterComponent> = () => <FooterComponent />;

export const Footer = Template.bind({});
