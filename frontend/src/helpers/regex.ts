export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const COMMON_PASSWORD_REGEX =
  /^(?:password|password123|123456|12345678|123456789|1234567890|qwerty|qwerty123|admin|admin123|letmein|welcome|iloveyou|000000|abc123)$/i;

export const isCommonPassword = (value: string) =>
  COMMON_PASSWORD_REGEX.test(value.trim());
