import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeWrapper } from '../../../.storybook/preview';
import CTAButtonComponent from '../CTAButton';

import type { CTAButtonProps } from '../CTAButton';

export default {
  title: 'Landing/CTAButton',
  component: CTAButtonComponent,
  argTypes: {},
} as ComponentMeta<typeof CTAButtonComponent>;

const Template: ComponentStory<typeof CTAButtonComponent> = (args: CTAButtonProps) => (
  <ThemeWrapper>
    <MemoryRouter>
      <CTAButtonComponent {...args} />
    </MemoryRouter>
  </ThemeWrapper>
);

export const CTAButton = Template.bind({});
CTAButton.args = { text: 'Register to receive updates' };

export const ShortText = Template.bind({});
ShortText.args = { text: 'Register' };

export const LongText = Template.bind({});
LongText.args = { text: 'This is a really long button and the text should wrap to maintain a max width' };
