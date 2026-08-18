export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[0-9]{7,15}$/.test(phone.trim());
}

export function isValidPostalCode(code: string): boolean {
  return /^[A-Za-z0-9\- ]{3,10}$/.test(code.trim());
}

export interface FieldErrors {
  [field: string]: string | undefined;
}
