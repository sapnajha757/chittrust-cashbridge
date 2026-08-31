/**
 * Indian phone number validation & normalization utilities for ChitTrust + CashBridge
 */

export function normalizeIndianPhone(input: string): string {
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return `+${digitsOnly}`;
  }

  if (input.startsWith('+91') && digitsOnly.length === 12) {
    return input;
  }

  return input;
}

export function validateIndianPhone(input: string): { valid: boolean; formatted: string; error?: string } {
  const digitsOnly = input.replace(/\D/g, '');

  let raw10 = digitsOnly;
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    raw10 = digitsOnly.slice(2);
  }

  if (raw10.length !== 10) {
    return {
      valid: false,
      formatted: input,
      error: 'Please enter a valid 10-digit mobile number.',
    };
  }

  // Indian mobile numbers typically start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(raw10)) {
    return {
      valid: false,
      formatted: input,
      error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
    };
  }

  return {
    valid: true,
    formatted: `+91${raw10}`,
  };
}
