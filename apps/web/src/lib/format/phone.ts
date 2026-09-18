export function sanitizePhoneInput(value: string): string {
  return value.replace(/[^\d\s+]/g, '')
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

export function isUsTenDigit(value: string): boolean {
  const trimmed = value.trim()
  return !trimmed.startsWith('+') && digitsOnly(trimmed).length === 10
}

export function normalizeOnBlur(value: string): string {
  const trimmed = value.trim()
  if (isUsTenDigit(trimmed)) {
    return `+1 ${trimmed}`
  }
  return value
}
