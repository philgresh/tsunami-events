import { render, screen } from '@testing-library/react';
import { SMSToS } from '../SMSToS';

describe('SMSToS', () => {
  it('renders a header', async () => {
    render(<SMSToS />);
    await screen.findByText('SMS Terms of Service');
  });

  it('renders paragraphs', async () => {
    render(<SMSToS />);
    await screen.findByText(/1. /g);
    await screen.findByText(/2. /g);
  });
});
