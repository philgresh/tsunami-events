import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VerifyPhoneDialog } from '../VerifyPhoneDialog';
import type { VerifyPhoneDialogProps } from '../VerifyPhoneDialog';

describe('VerifyPhoneDialog', () => {
  const onSubmit = jest.fn();
  const onClose = jest.fn();
  const defaultProps: VerifyPhoneDialogProps = {
    open: true,
    onSubmit,
    onClose,
  };

  /** `renderVerifyPhoneDialog` is a test-only function to return a rendered instance of VerifyPhoneDialog  */
  const renderVerifyPhoneDialog = async (overrideProps?: Partial<VerifyPhoneDialogProps>) => {
    const props = {
      ...defaultProps,
      ...overrideProps,
    };
    return render(<VerifyPhoneDialog {...props} />);
  };

  it('renders nothing if "open" is false', async () => {
    await renderVerifyPhoneDialog({ open: false });
    expect(screen.queryAllByText('Verify Phone Number')).toHaveLength(0);
  });

  it('renders the form if "open" is true', async () => {
    await renderVerifyPhoneDialog();
    expect(await screen.findByText('Verify Phone Number')).toBeInTheDocument();
  });

  describe('code text field', () => {
    it('renders a text field for entering the code', async () => {
      await renderVerifyPhoneDialog();
      const textField = await screen.findByLabelText('Verification Code');
      expect(textField).toHaveValue('');
    });

    it('allows typing and changes the state', async () => {
      await renderVerifyPhoneDialog();
      const textField = await screen.findByLabelText('Verification Code');
      await userEvent.type(textField, '012345');
      expect(textField).toHaveValue('012345');
      expect(textField).toHaveDisplayValue('012345');
    });
  });

  describe('cancel button', () => {
    it('renders a button', async () => {
      await renderVerifyPhoneDialog();
      await screen.findByRole('button', { name: /cancel/i });
    });

    it('can be clicked, which calls the "onClose" callback', async () => {
      await renderVerifyPhoneDialog();
      const cancelButton = await screen.findByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('verify button', () => {
    it('renders a button', async () => {
      await renderVerifyPhoneDialog();
      await screen.findByRole('button', { name: /verify/i });
    });

    it('is disabled until a code is entered', async () => {
      await renderVerifyPhoneDialog();
      const verifyButton = await screen.findByRole('button', { name: /verify/i });
      expect(verifyButton).toBeDisabled();
    });

    it('can be clicked when enabled, which calls the "onSubmit" callback', async () => {
      await renderVerifyPhoneDialog();

      const textField = await screen.findByLabelText('Verification Code');
      await userEvent.type(textField, '012345');

      const verifyButton = await screen.findByRole('button', { name: /verify/i });
      await userEvent.click(verifyButton);
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
