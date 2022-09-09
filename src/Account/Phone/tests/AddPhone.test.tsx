import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddPhone, PhoneNumberInput } from '../components/AddPhone';
import type { AddPhoneProps, PhoneNumberInputProps } from '../components/AddPhone';

const validPhoneNumber = '+1 415 867 5309';

describe('PhoneNumberInput', () => {
  const handleChange = jest.fn();
  const defaultProps: PhoneNumberInputProps = {
    value: '',
    handleChange,
  };

  /** `renderPhoneNumberInput` is a test-only function to return a rendered instance of PhoneNumberInput  */
  const renderPhoneNumberInput = async (overrideProps?: Partial<PhoneNumberInputProps>) => {
    const props = {
      ...defaultProps,
      ...overrideProps,
    };
    return render(<PhoneNumberInput {...props} />);
  };

  it('renders', async () => {
    await renderPhoneNumberInput();
    await screen.findByRole('textbox');
  });

  it('displays a value', async () => {
    await renderPhoneNumberInput({ value: validPhoneNumber });
    await screen.findByDisplayValue(validPhoneNumber);
  });

  it('passes back changed values', async () => {
    await renderPhoneNumberInput();
    const textBox = await screen.findByRole('textbox');

    await userEvent.type(textBox, validPhoneNumber);
    expect(handleChange).toHaveBeenCalled();
  });

  it('displays errors', async () => {
    await renderPhoneNumberInput({ error: 'Invalid phone number format' });
    await screen.findByText('Invalid phone number format');
  });
});

describe('AddPhone', () => {
  const setUserPhone = jest.fn();
  const defaultProps: AddPhoneProps = {
    uid: 'abcd-1234',
    setUserPhone,
  };

  /** `renderAddPhone` is a test-only function to return a rendered instance of AddPhone  */
  const renderAddPhone = async (overrideProps?: Partial<AddPhoneProps>) => {
    const props = {
      ...defaultProps,
      ...overrideProps,
    };
    return render(<AddPhone {...props} />);
  };

  it('renders a phone number input', async () => {
    // See PhoneNumberInput above
    await renderAddPhone();
    await screen.findByRole('textbox');
  });

  describe('SMS TOS agree switch', () => {
    it('renders', async () => {
      await renderAddPhone();
      await screen.findByLabelText(/SMS Terms of Service/i);
    });

    it('renders a label with a link to the SMS TOS', async () => {
      await renderAddPhone();
      const link = await screen.findByRole('link', { name: 'SMS TOS' });
      expect(link.getAttribute('href')).toBe('/sms_tos');
    });
  });

  describe('Add Phone button', () => {
    it('displays a button that says "Add Phone"', async () => {
      await renderAddPhone();
      await screen.findByRole('button', { name: /add phone/i });
    });

    it('is initially disabled', async () => {
      await renderAddPhone();
      const addPhoneButton = await screen.findByRole('button', { name: /add phone/i });
      expect(addPhoneButton).toBeDisabled();
    });

    it('is enabled when there is a phone number value and the TOS are agreed to', async () => {
      await renderAddPhone();
      const addPhoneButton = await screen.findByRole('button', { name: /add phone/i });
      expect(addPhoneButton).toBeDisabled();

      const phoneNumberInput = await screen.findByRole('textbox');
      await userEvent.clear(phoneNumberInput);
      await userEvent.type(phoneNumberInput, validPhoneNumber);
      await screen.findByDisplayValue(validPhoneNumber);

      const checkbox = await screen.findByLabelText(/SMS Terms of Service/i);
      await userEvent.click(checkbox);

      expect(addPhoneButton).not.toBeDisabled();
    });
  });
});
