import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddPhone } from '../components/AddPhone';
import type { AddPhoneProps } from '../components/AddPhone';

// describe('AddPhone', () => {
//   const setUserPhone = jest.fn();
//   const defaultProps: AddPhoneProps = {
//     uid: 'abcd-1234',
//     setUserPhone,
//   };

//   /** `renderAddPhone` is a test-only function to return a rendered instance of AddPhone  */
//   const renderAddPhone = async (overrideProps?: Partial<AddPhoneProps>) => {
//     const props = {
//       ...defaultProps,
//       ...overrideProps,
//     };
//     return render(<AddPhone {...props} />);
//   };

//   it('displays "Verified" if the status is "approved"', async () => {
//     await renderExistingPhone({ status: 'approved' });
//     await screen.findByText('Verified');
//   });

//   it('displays a button that says "Verifying" if the status is not approved and "loading" is true', async () => {
//     await renderExistingPhone({ status: 'pending', loading: true });
//     const button = screen.getByRole('button', { name: /verifying/i });
//     expect(button).toBeDisabled();
//   });

//   it('displays a button that says "Verify phone number" if the status is not approved and "loading" is false', async () => {
//     await renderExistingPhone({ status: 'pending', loading: false });
//     const button = screen.getByRole('button', { name: /verify phone/i });
//     expect(button).not.toBeDisabled();
//   });

//   it('displays a button that is clickable', async () => {
//     await renderExistingPhone({ status: 'pending', loading: false });
//     const button = screen.getByRole('button', { name: /verify phone/i });
//     await userEvent.click(button);
//     expect(onClickVerifyButton).toHaveBeenCalled();
//   });
// });
