import parsePhoneNumber from 'libphonenumber-js';
import { DEFAULT_COUNTRY } from './constants';

const EXPOSED_DIGITS_LENGTH = 4;

/**
 * `getPhoneNumberDisplay` redacts the main portion of a phone number, leaving the country code
 * and final 4 digits exposed.
 * getPhoneNumberDisplay('+919255505367'); // '+91******5367'
 */
export const getPhoneNumberDisplay = (phoneNumber: string): string => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber, DEFAULT_COUNTRY);
  if (!parsedPhoneNumber) return 'invalid';
  const { countryCallingCode, nationalNumber } = parsedPhoneNumber;
  const n = nationalNumber.length;
  const redactedDigitsLength = n - EXPOSED_DIGITS_LENGTH;
  const replacerRegExp = new RegExp(`[0-9]{${redactedDigitsLength}}`);
  const redaction = '*'.repeat(redactedDigitsLength);
  const redactedPhoneNumber = nationalNumber.replace(replacerRegExp, (_, p1) => redaction);

  return `+${countryCallingCode}${redactedPhoneNumber}`;
};
