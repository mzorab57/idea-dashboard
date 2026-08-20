export const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{6,}$/;

export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 6 characters and include uppercase, lowercase, number, symbol, with no spaces.';

export function isStrongPassword(value = '') {
  return PASSWORD_POLICY_REGEX.test(value);
}
