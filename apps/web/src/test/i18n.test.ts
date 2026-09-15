import { describe, expect, it } from 'vitest'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../app/i18n/locales'

describe('Web App i18n Configuration Unit Test', () => {
  it('defines default locale as English (en)', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })

  it('supports English and Tamil locales', () => {
    const codes = SUPPORTED_LOCALES.map((l) => l.code)
    expect(codes).toContain('en')
    expect(codes).toContain('ta')
  })
})
