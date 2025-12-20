import { validateEmail, validatePhone, truncateText } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+12345678901')).toBe(true)
      expect(validatePhone('1234567890')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('abc')).toBe(false)
    })
  })

  describe('truncateText', () => {
    it('should truncate text longer than limit', () => {
      const text = 'This is a long text that needs truncating'
      expect(truncateText(text, 10)).toBe('This is a ...')
    })

    it('should not truncate text shorter than limit', () => {
      const text = 'Short text'
      expect(truncateText(text, 20)).toBe('Short text')
    })
  })
})