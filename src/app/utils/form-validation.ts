export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isRequired(value: string, message = 'Este campo es obligatorio.'): string {
  return value.trim() ? '' : message;
}

export function minLength(value: string, min: number, message?: string): string {
  return value.trim().length >= min
    ? ''
    : (message ?? `Debe tener al menos ${min} caracteres.`);
}

export function isPhoneNineDigits(value: string): boolean {
  return /^\d{9}$/.test(value.replace(/\s/g, ''));
}
