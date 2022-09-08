import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExistingPhone } from '../ExistingPhone';
import type { ExistingPhoneProps } from '../ExistingPhone';

describe('ExistingPhone', () => {
  const onClickVerifyButton = jest.fn();
  const defaultProps: ExistingPhoneProps = {
    phoneNumber: '+14158675309',
    loading: false,
    onClickVerifyButton,
  };

  /** `renderExistingPhone` is a test-only function to return a rendered instance of ExistingPhone  */
  const renderExistingPhone = async (overrideProps?: Partial<ExistingPhoneProps>) => {
    const props = {
      ...defaultProps,
      ...overrideProps,
    };
    return render(<ExistingPhone {...props} />);
  };

  it('displays "Verified" if the status is "approved"', async () => {
    await renderExistingPhone({ status: 'approved' });
    await screen.findByText('Verified');
  });

  it('displays a button that says "Verifying" if the status is not approved and "loading" is true', async () => {
    await renderExistingPhone({ status: 'pending', loading: true });
    const button = screen.getByRole('button', { name: /verifying/i });
    expect(button).toBeDisabled();
  });

  it('displays a button that says "Verify phone number" if the status is not approved and "loading" is false', async () => {
    await renderExistingPhone({ status: 'pending', loading: false });
    const button = screen.getByRole('button', { name: /verify phone/i });
    expect(button).not.toBeDisabled();
  });

  it('displays a button that is clickable', async () => {
    await renderExistingPhone({ status: 'pending', loading: false });
    const button = screen.getByRole('button', { name: /verify phone/i });
    await userEvent.click(button);
    expect(onClickVerifyButton).toHaveBeenCalled();
  });
});
