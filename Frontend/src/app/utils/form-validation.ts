export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function emailFormatError(value: string): string {
  return isValidEmail(value) ? '' : 'Ingresa un correo válido.';
}

export function isRequired(value: string, message = 'Este campo es obligatorio.'): string {
  return value.trim() ? '' : message;
}

export function minLength(value: string, min: number, message?: string): string {
  return value.trim().length >= min
    ? ''
    : (message ?? `Debe tener al menos ${min} caracteres.`);
}

export function dniEightDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 8 ? '' : 'El DNI debe tener exactamente 8 dígitos.';
}

export function phoneNineDigits(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 9 ? '' : 'El teléfono debe tener exactamente 9 dígitos.';
}

/** @deprecated Use phoneNineDigits for error messages or /^\d{9}$/.test() for boolean checks */
export function isPhoneNineDigits(value: string): boolean {
  return /^\d{9}$/.test(value.replace(/\s/g, ''));
}

export function birthDateNotFuture(value: string): string {
  if (!value) return '';
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected > today ? 'La fecha de nacimiento no puede ser posterior a hoy.' : '';
}

export function sanitizeDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
