import { render, screen } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import sinon from 'sinon';
import * as functions from '../functions';
import { useVerifyPhone } from '../hooks';

describe('useVerifyPhone', () => {
  const attemptVerifyPhone = sinon.stub(functions, 'attemptVerifyPhone').resolves();

  it('returns an initial state', () => {
    const { result } = renderHook(() => useVerifyPhone(attemptVerifyPhone));
    expect(result.current).toMatchObject({
      error: undefined,
      loading: false,
      isOpen: false,
    });
  });

  it('returns a `VerifyPhoneButton` component that opens the dialog', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useVerifyPhone(attemptVerifyPhone));
    const VerifyPhoneButton = result.current.VerifyPhoneButton;

    render(<VerifyPhoneButton />);

    expect(result.current.isOpen).toBe(false);

    const button = await screen.findByText('Verify phone number');
    expect(button).not.toBeDisabled();

    await user.click(button);
    expect(result.current.isOpen).toBe(true);
  });

  describe('handleVerifyPhone', () => {
    it('sets an error if the call to attemptVerifyPhone returns an error', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useVerifyPhone(attemptVerifyPhone));

      attemptVerifyPhone.rejects('error: blah blah');

      // Initial state setup, assume the dialog is open
      act(() => result.current.setIsOpen(true));
      expect(result.current.isOpen).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();

      await act(async () => {
        await result.current.handleVerifyPhone('123456');
      }).then(async () => await waitForNextUpdate({ timeout: 10000 }));

      expect(attemptVerifyPhone.called).toBe(true);
      expect(result.current.error?.message).toBe('Unable to verify phone number: error: blah blah');
      expect(result.current.loading).toBe(false);
    }, 10000);

    it('restores loading state if call to attemptVerifyPhone is successful', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useVerifyPhone(attemptVerifyPhone));

      attemptVerifyPhone.resolves();

      // Initial state setup, assume the dialog is open
      act(() => result.current.setIsOpen(true));
      expect(result.current.isOpen).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();

      await act(async () => {
        await result.current.handleVerifyPhone('123456');
      }).then(async () => await waitForNextUpdate({ timeout: 10000 }));

      expect(attemptVerifyPhone.called).toBe(true);
      expect(result.current.error).toBeUndefined();
      expect(result.current.loading).toBe(false);
    }, 10000);
  });
});
