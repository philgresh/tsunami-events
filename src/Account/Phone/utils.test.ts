import { getPhoneNumberDisplay } from './utils';

describe('getPhoneNumberDisplay', () => {
  it('returns "invalid" if the number is not parsable', () => {
    expect(getPhoneNumberDisplay('no-numbers-here')).toBe('invalid');
  });

  it('redacts the first N numbers of the "national number" with an asterisk', () => {
    const phoneNumberIndia = '+919255505367';
    expect(getPhoneNumberDisplay(phoneNumberIndia)).toBe('+91******5367');

    const phoneNumberUS = '+14158675309';
    expect(getPhoneNumberDisplay(phoneNumberUS)).toBe('+1******5309');
  });
});
