import { act, renderHook } from '@testing-library/react-hooks';
import sinon from 'sinon';
import * as functions from '../functions';
import { useVerifyPhone, useAddPhone } from '../hooks';

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

describe('useAddPhone', () => {
  const uid = 'abcd-1234';
  const validPhoneNumber = '+1 415 867 5309';
  const invalidPhoneNumber = 'not-a-real-phone-number';
  let setUserPhone = jest.fn().mockResolvedValue({});

  afterEach(() => {
    setUserPhone = jest.fn().mockResolvedValue({});
  });

  it('returns an initial state', () => {
    const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
    expect(result.current).toMatchObject({
      error: undefined,
      hasAgreed: false,
      numberValue: '',
    });
  });

  describe('handleAgreeChange', () => {
    it('changes the state when a checkbox is clicked', async () => {
      const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
      expect(result.current.hasAgreed).toBe(false);

      act(() => {
        result.current.handleAgreeChange(undefined, true);
      });
      expect(result.current.hasAgreed).toBe(true);
    });
  });

  describe('handleValueChange', () => {
    it('changes the state when a value is entered into an input field', () => {
      const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
      expect(result.current.numberValue).toBe('');

      act(() => {
        result.current.handleValueChange(validPhoneNumber);
      });
      expect(result.current.numberValue).toBe(validPhoneNumber);
    });

    it('clears the error state if present', () => {
      const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
      act(() => {
        result.current.setError('a wild error appears');
      });
      expect(result.current.error).toBe('a wild error appears');

      act(() => {
        result.current.handleValueChange(validPhoneNumber);
      });
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('handleSubmit', () => {
    it('validates "numberValue" values and sets an error if invalid', async () => {
      const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
      act(() => {
        result.current.handleValueChange(invalidPhoneNumber);
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.error).toBe('Invalid phone number format');
      expect(setUserPhone).not.toHaveBeenCalled();
    });

    it('calls "setUserPhone" after validation', async () => {
      const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
      act(() => {
        result.current.handleValueChange(validPhoneNumber);
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(setUserPhone).toHaveBeenCalled();
      expect(result.current.error).toBeUndefined();
    });

    it('sets any errors returned by "setUserPhone"', async () => {
      setUserPhone.mockRejectedValue(new Error('internal: invalid phone number'));
      const { result } = renderHook(() => useAddPhone(setUserPhone, uid));
      act(() => {
        result.current.handleValueChange(validPhoneNumber);
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(setUserPhone).toHaveBeenCalled();
      expect(result.current.error).toBe('internal: invalid phone number');
    });
  });
});
