export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' }
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]['code']
export const DEFAULT_LOCALE: SupportedLocale = 'en'
