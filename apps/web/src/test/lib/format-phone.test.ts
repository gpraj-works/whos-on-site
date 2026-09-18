import { describe, expect, it } from 'vitest'
import { phoneSchema, registerSchema } from '@whosonsite/shared'
import {
  digitsOnly,
  isUsTenDigit,
  normalizeOnBlur,
  sanitizePhoneInput
} from '../../lib/format/phone'

describe('Phone Utility Functions', () => {
  describe('sanitizePhoneInput', () => {
    it('strips parentheses, dashes, and dots while keeping digits, spaces, and +', () => {
      expect(sanitizePhoneInput('(404) 555-0191')).toBe('404 5550191')
      expect(sanitizePhoneInput('+1 (555) 019-2345')).toBe('+1 555 0192345')
      expect(sanitizePhoneInput('404.555.0192')).toBe('4045550192')
      expect(sanitizePhoneInput('abc 123 #$%')).toBe(' 123 ')
    })

    it('preserves valid plain numbers and international prefixes', () => {
      expect(sanitizePhoneInput('+44 7911 123456')).toBe('+44 7911 123456')
      expect(sanitizePhoneInput('4045550192')).toBe('4045550192')
    })
  })

  describe('digitsOnly', () => {
    it('extracts only numeric characters', () => {
      expect(digitsOnly('(404) 555-0191')).toBe('4045550191')
      expect(digitsOnly('+1 555 0192')).toBe('15550192')
      expect(digitsOnly('+44 7911 123456')).toBe('447911123456')
      expect(digitsOnly('')).toBe('')
    })
  })

  describe('isUsTenDigit', () => {
    it('returns true for 10-digit numbers without leading +', () => {
      expect(isUsTenDigit('4045550192')).toBe(true)
      expect(isUsTenDigit(' 404 555 0192 ')).toBe(true)
    })

    it('returns false for numbers that already have a leading +', () => {
      expect(isUsTenDigit('+1 4045550192')).toBe(false)
      expect(isUsTenDigit('+44 7911 123456')).toBe(false)
    })

    it('returns false for numbers with count other than 10 digits', () => {
      expect(isUsTenDigit('5550192')).toBe(false)
      expect(isUsTenDigit('14045550192')).toBe(false)
      expect(isUsTenDigit('')).toBe(false)
    })
  })

  describe('normalizeOnBlur', () => {
    it('prepends +1 for bare 10-digit US numbers', () => {
      expect(normalizeOnBlur('4045550192')).toBe('+1 4045550192')
      expect(normalizeOnBlur('404 555 0192')).toBe('+1 404 555 0192')
    })

    it('leaves international and already prefixed numbers unchanged', () => {
      expect(normalizeOnBlur('+1 404 555 0192')).toBe('+1 404 555 0192')
      expect(normalizeOnBlur('+44 7911 123456')).toBe('+44 7911 123456')
    })

    it('leaves incomplete or non-10-digit numbers unchanged', () => {
      expect(normalizeOnBlur('555 0192')).toBe('555 0192')
      expect(normalizeOnBlur('')).toBe('')
    })
  })
})

describe('Phone Schema Validation', () => {
  it('validates 7 to 15 digit phone numbers with standard formatting', () => {
    expect(phoneSchema.safeParse('4045550192').success).toBe(true)
    expect(phoneSchema.safeParse('+1 555-0192').success).toBe(true)
    expect(phoneSchema.safeParse('(404) 555-0191').success).toBe(true)
    expect(phoneSchema.safeParse('+44 7911 123456').success).toBe(true)
    expect(phoneSchema.safeParse('5550192').success).toBe(true)
  })

  it('rejects numbers with fewer than 7 or more than 15 digits', () => {
    const tooShort = phoneSchema.safeParse('123456')
    expect(tooShort.success).toBe(false)
    if (!tooShort.success) {
      expect(tooShort.error.errors[0].message).toBe('Enter a valid phone number')
    }

    const tooLong = phoneSchema.safeParse('1234567890123456')
    expect(tooLong.success).toBe(false)
    if (!tooLong.success) {
      expect(tooLong.error.errors[0].message).toBe('Enter a valid phone number')
    }
  })

  it('rejects numbers containing invalid characters or letters', () => {
    const invalid = phoneSchema.safeParse('404555019a')
    expect(invalid.success).toBe(false)
  })

  it('validates phone field inside registerSchema', () => {
    const valid = registerSchema.safeParse({
      companyName: 'Acme Corp',
      email: 'admin@acme.com',
      phone: '+14045550192',
      password: 'password123',
      address: '123 Main St, Atlanta, GA'
    })
    expect(valid.success).toBe(true)

    const invalid = registerSchema.safeParse({
      companyName: 'Acme Corp',
      email: 'admin@acme.com',
      phone: '123',
      password: 'password123',
      address: '123 Main St, Atlanta, GA'
    })
    expect(invalid.success).toBe(false)
  })
})

describe('International Phone Parsing', () => {
  it('parses default countries correctly', async () => {
    const { parseCountry, defaultCountries } = await import('react-international-phone')

    const usData = defaultCountries.find((c) => parseCountry(c).iso2 === 'us')
    expect(usData).toBeDefined()
    if (usData) {
      const us = parseCountry(usData)
      expect(us.iso2).toBe('us')
      expect(us.dialCode).toBe('1')
    }

    const gbData = defaultCountries.find((c) => parseCountry(c).iso2 === 'gb')
    expect(gbData).toBeDefined()
    if (gbData) {
      const gb = parseCountry(gbData)
      expect(gb.iso2).toBe('gb')
      expect(gb.dialCode).toBe('44')
    }

    const inData = defaultCountries.find((c) => parseCountry(c).iso2 === 'in')
    expect(inData).toBeDefined()
    if (inData) {
      const india = parseCountry(inData)
      expect(india.iso2).toBe('in')
      expect(india.dialCode).toBe('91')
    }
  })
})
