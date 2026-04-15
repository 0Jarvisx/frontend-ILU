// ─── Shared Validation Utilities ────────────────────────────────────────────

/** Auto-formats a phone string to ####-#### as the user types */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** Returns true if value matches ####-#### (exactly 8 digits with dash) */
export function isValidPhone(value: string): boolean {
  return /^\d{4}-\d{4}$/.test(value);
}

/** Returns true if value is a well-formed email address */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
