import * as z from 'zod'
import i18n from '../i18n'

/**
 * Building blocks shared by every form schema.
 *
 * Schemas are plain modules: no React and no API calls. Messages say how to fix
 * the value, and are looked up when a value is validated (not when the schema is
 * created), so they follow the language the user has picked.
 *
 * The frontend defines these rules and the API enforces the same ones.
 */

/** A custom message, translated at validation time. */
export const msg = (key: string, params?: Record<string, unknown>) => ({ error: () => i18n.t(key, params) })

// --- Text ------------------------------------------------------------------------

export const NAME_MAX = 255
export const EMAIL_MAX = 255
export const URL_MAX = 2048

/** At most `max` characters, with a message saying so. */
export const maxLength = (max: number) => msg('validation.maxLength', { max })

/** Trimmed text that must not be blank. */
export const requiredText = (requiredKey = 'validation.required', max = NAME_MAX) =>
  z.string().trim().min(1, msg(requiredKey)).max(max, maxLength(max))

/** Zod's email check and nothing more; the confirmation email is the real test. */
export const email = (requiredKey = 'common.enterYourEmailAddress') =>
  z
    .string()
    .trim()
    .min(1, msg(requiredKey))
    .max(EMAIL_MAX, maxLength(EMAIL_MAX))
    .pipe(z.email(msg('admin.users.enterAValidEmailAddress')))

/** Blank means "none"; anything else must be an http(s) address. */
export const optionalHttpUrl = () =>
  z
    .string()
    .trim()
    .max(URL_MAX, maxLength(URL_MAX))
    .refine((value) => value === '' || isHttpUrl(value), msg('validation.imageUrl'))

function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// --- Passwords -----------------------------------------------------------------

export const PASSWORD_MIN = 8

/**
 * The rule for every new password: 8+ characters, at least one number and one
 * uppercase letter. Logging in only checks that a password was typed, so
 * accounts created under older rules can still sign in.
 */
export const newPassword = (requiredKey = 'signup.chooseAPassword') =>
  z
    .string()
    .min(1, msg(requiredKey))
    .min(PASSWORD_MIN, msg('common.mustBeAtLeast8Characters'))
    .regex(/\d/, msg('common.includeAtLeastOneNumber'))
    .regex(/[A-Z]/, msg('validation.passwordUppercase'))

// --- Numbers typed into inputs ---------------------------------------------------

/** A number from `min` to `max`, with one message that names the range. */
export const between = (min: number, max: number) => {
  const message = msg('validation.between', { min, max })
  return z.number().min(min, message).max(max, message)
}

/** A whole number from `min` to `max`. */
export const wholeBetween = (min: number, max: number) => {
  const message = msg('validation.wholeBetween', { min, max })
  return z.number().int(message).min(min, message).max(max, message)
}

/**
 * Inputs hold strings. These turn them into numbers for the request, then apply
 * `rules` to the number. A blank optional input becomes null, which the API
 * reads as "not given".
 */
export const requiredNumber = <T extends z.ZodType<number, number>>(rules: T, requiredKey = 'validation.required') =>
  z
    .string()
    .trim()
    .min(1, msg(requiredKey))
    .transform(Number)
    .pipe(z.number(msg('validation.number')).pipe(rules))

export const optionalNumber = <T extends z.ZodType<number, number>>(rules: T) =>
  z
    .string()
    .trim()
    .transform((value) => (value === '' ? null : Number(value)))
    .pipe(z.number(msg('validation.number')).pipe(rules).nullable())
