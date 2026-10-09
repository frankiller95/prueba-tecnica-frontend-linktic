/** Regla de validación compatible con la prop `rules` de los campos de Quasar. */
export type ValidationRule = (value: unknown) => true | string;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;

  return false;
}

export function required(message = 'Este campo es obligatorio.'): ValidationRule {
  return (value) => !isEmptyValue(value) || message;
}

export function email(message = 'Ingresa un correo válido.'): ValidationRule {
  return (value) => (typeof value === 'string' && EMAIL_PATTERN.test(value.trim())) || message;
}
