import { describe, expect, it } from 'vitest'
import * as z from 'zod'
import i18n from '../i18n'
import { errorsOf, parse } from '../test/zod'
import {
  EMAIL_MAX,
  NAME_MAX,
  URL_MAX,
  between,
  email,
  maxLength,
  msg,
  newPassword,
  optionalHttpUrl,
  optionalNumber,
  requiredNumber,
  requiredText,
  wholeBetween,
} from './shared'

const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

describe('msg', () => {
  it('translates when the error is produced, so it follows the current language', async () => {
    const schema = z.string().min(1, msg('validation.required'))
    const english = errorsOf(schema, '')?.['']
    await i18n.changeLanguage('bg')
    try {
      const bulgarian = errorsOf(schema, '')?.['']
      expect(bulgarian).toBe(i18n.t('validation.required'))
      expect(bulgarian).not.toBe(english)
    } finally {
      await i18n.changeLanguage('en')
    }
  })

  it('passes interpolation params through', () => {
    expect(maxLength(5).error()).toBe(t('validation.maxLength', { max: 5 }))
  })
})

describe('requiredText', () => {
  it('trims the value', () => {
    expect(parse(requiredText(), '  hello  ')).toBe('hello')
  })

  it('rejects blank and whitespace-only text with the given key', () => {
    expect(errorsOf(requiredText('common.nameIsRequired'), '   ')).toEqual({ '': t('common.nameIsRequired') })
    expect(errorsOf(requiredText(), '')).toEqual({ '': t('validation.required') })
  })

  it('enforces the maximum length (default NAME_MAX)', () => {
    expect(errorsOf(requiredText(), 'a'.repeat(NAME_MAX))).toBeNull()
    expect(errorsOf(requiredText(), 'a'.repeat(NAME_MAX + 1))).toEqual({ '': t('validation.maxLength', { max: NAME_MAX }) })
    expect(errorsOf(requiredText(undefined, 3), 'abcd')).toEqual({ '': t('validation.maxLength', { max: 3 }) })
  })
})

describe('email', () => {
  it('accepts and trims a valid address', () => {
    expect(parse(email(), '  ada@example.com ')).toBe('ada@example.com')
  })

  it('reports a missing address with the required key', () => {
    expect(errorsOf(email(), '')).toEqual({ '': t('common.enterYourEmailAddress') })
    expect(errorsOf(email('custom.key'), ' ')).toEqual({ '': t('custom.key') })
  })

  it.each(['ada', 'ada@', '@example.com', 'ada example.com'])('rejects malformed address %j', (value) => {
    expect(errorsOf(email(), value)).toEqual({ '': t('admin.users.enterAValidEmailAddress') })
  })

  it('rejects addresses over EMAIL_MAX characters', () => {
    const long = `${'a'.repeat(EMAIL_MAX)}@example.com`
    expect(errorsOf(email(), long)).toEqual({ '': t('validation.maxLength', { max: EMAIL_MAX }) })
  })
})

describe('optionalHttpUrl', () => {
  it('treats blank as "none"', () => {
    expect(parse(optionalHttpUrl(), '   ')).toBe('')
  })

  it.each(['http://a.com', 'https://example.com/path?q=1'])('accepts %s', (value) => {
    expect(parse(optionalHttpUrl(), value)).toBe(value)
  })

  it.each(['ftp://example.com', 'javascript:alert(1)', 'example.com', 'not a url'])('rejects %s', (value) => {
    expect(errorsOf(optionalHttpUrl(), value)).toEqual({ '': t('validation.imageUrl') })
  })

  it('rejects URLs longer than URL_MAX', () => {
    const long = `https://example.com/${'a'.repeat(URL_MAX)}`
    expect(errorsOf(optionalHttpUrl(), long)?.['']).toBe(t('validation.maxLength', { max: URL_MAX }))
  })
})

describe('newPassword', () => {
  it('accepts 8+ characters with a digit and an uppercase letter', () => {
    expect(errorsOf(newPassword(), 'Password1')).toBeNull()
  })

  it.each([
    ['', 'signup.chooseAPassword'],
    ['Pass1', 'common.mustBeAtLeast8Characters'],
    ['Password', 'common.includeAtLeastOneNumber'],
    ['password1', 'validation.passwordUppercase'],
  ])('rejects %j with %s', (value, key) => {
    expect(errorsOf(newPassword(), value)?.['']).toBe(t(key))
  })

  it('uses a custom required key', () => {
    expect(errorsOf(newPassword('resetPassword.chooseANewPassword2'), '')?.['']).toBe(t('resetPassword.chooseANewPassword2'))
  })
})

describe('between / wholeBetween', () => {
  it('between is inclusive and allows decimals', () => {
    const schema = between(1, 10)
    expect(errorsOf(schema, 1)).toBeNull()
    expect(errorsOf(schema, 10)).toBeNull()
    expect(errorsOf(schema, 5.5)).toBeNull()
    expect(errorsOf(schema, 0.99)).toEqual({ '': t('validation.between', { min: 1, max: 10 }) })
    expect(errorsOf(schema, 10.01)).toEqual({ '': t('validation.between', { min: 1, max: 10 }) })
  })

  it('wholeBetween also rejects fractions', () => {
    const message = t('validation.wholeBetween', { min: 1, max: 7 })
    expect(errorsOf(wholeBetween(1, 7), 3)).toBeNull()
    expect(errorsOf(wholeBetween(1, 7), 3.5)).toEqual({ '': message })
    expect(errorsOf(wholeBetween(1, 7), 8)).toEqual({ '': message })
  })
})

describe('requiredNumber', () => {
  const schema = requiredNumber(between(1, 100))

  it('turns the input string into a number', () => {
    expect(parse(schema, ' 42 ')).toBe(42)
    expect(parse(schema, '2.5')).toBe(2.5)
  })

  it('reports a blank input as required (custom key supported)', () => {
    expect(errorsOf(schema, '  ')).toEqual({ '': t('validation.required') })
    expect(errorsOf(requiredNumber(between(1, 2), 'bodyMeasurements.weightIsRequired'), '')).toEqual({
      '': t('bodyMeasurements.weightIsRequired'),
    })
  })

  it('reports non-numeric text', () => {
    expect(errorsOf(schema, 'abc')).toEqual({ '': t('validation.number') })
  })

  it('applies the range rules to the number', () => {
    expect(errorsOf(schema, '101')).toEqual({ '': t('validation.between', { min: 1, max: 100 }) })
  })
})

describe('optionalNumber', () => {
  const schema = optionalNumber(between(1, 100))

  it('turns a blank input into null', () => {
    expect(parse(schema, '')).toBeNull()
    expect(parse(schema, '   ')).toBeNull()
  })

  it('parses and validates a given number', () => {
    expect(parse(schema, '7')).toBe(7)
    expect(errorsOf(schema, '0')).toEqual({ '': t('validation.between', { min: 1, max: 100 }) })
    expect(errorsOf(schema, 'x')).toEqual({ '': t('validation.number') })
  })
})
