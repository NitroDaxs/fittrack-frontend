import { describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { errorsOf, parse } from '../test/zod'
import { changePasswordSchema } from './change-password.schema'
import { CHAT_MESSAGE_MAX, chatMessageSchema } from './chat.schema'
import { editProfileSchema } from './edit-profile.schema'
import { forgotPasswordSchema } from './forgot-password.schema'
import { loginSchema } from './login.schema'
import { resetPasswordSchema } from './reset-password.schema'
import { signupSchema } from './signup.schema'

const t = (key: string) => i18n.t(key)

describe('loginSchema', () => {
  it('accepts an email and any non-empty password (older accounts may have weak ones)', () => {
    expect(parse(loginSchema, { email: ' ada@example.com ', password: 'x' })).toEqual({
      email: 'ada@example.com',
      password: 'x',
    })
  })

  it('reports every missing field at once', () => {
    expect(errorsOf(loginSchema, { email: '', password: '' })).toEqual({
      email: t('common.enterYourEmailAddress'),
      password: t('login.enterYourPassword'),
    })
  })
})

describe('signupSchema', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', password: 'Password1', confirm: 'Password1' }

  it('accepts a complete form', () => {
    expect(errorsOf(signupSchema, valid)).toBeNull()
  })

  it('accepts names of any shape', () => {
    expect(errorsOf(signupSchema, { ...valid, name: 'X Æ A-12' })).toBeNull()
  })

  it('requires the name, email, password and confirmation', () => {
    expect(errorsOf(signupSchema, { name: ' ', email: '', password: '', confirm: '' })).toMatchObject({
      name: t('signup.enterYourFullName'),
      email: t('common.enterYourEmailAddress'),
      password: t('signup.chooseAPassword'),
      confirm: t('signup.confirmYourPassword'),
    })
  })

  it('applies the new-password rules', () => {
    expect(errorsOf(signupSchema, { ...valid, password: 'weak', confirm: 'weak' })?.password).toBe(
      t('common.mustBeAtLeast8Characters'),
    )
  })

  it('reports a mismatched confirmation on the confirm field', () => {
    expect(errorsOf(signupSchema, { ...valid, confirm: 'Password2' })).toEqual({ confirm: t('common.passwordsDoNotMatch') })
  })
})

describe('forgotPasswordSchema', () => {
  it('validates the email', () => {
    expect(errorsOf(forgotPasswordSchema, { email: 'ada@example.com' })).toBeNull()
    expect(errorsOf(forgotPasswordSchema, { email: 'nope' })).toEqual({ email: t('admin.users.enterAValidEmailAddress') })
  })
})

describe('resetPasswordSchema', () => {
  it('accepts a matching strong password', () => {
    expect(errorsOf(resetPasswordSchema, { password: 'NewPass12', confirm: 'NewPass12' })).toBeNull()
  })

  it('requires both fields with reset-specific messages', () => {
    expect(errorsOf(resetPasswordSchema, { password: '', confirm: '' })).toEqual({
      password: t('resetPassword.chooseANewPassword2'),
      confirm: t('resetPassword.confirmYourNewPassword'),
    })
  })

  it('reports a mismatch on confirm', () => {
    expect(errorsOf(resetPasswordSchema, { password: 'NewPass12', confirm: 'NewPass13' })).toEqual({
      confirm: t('common.passwordsDoNotMatch'),
    })
  })
})

describe('changePasswordSchema', () => {
  const valid = { current: 'OldPass1', next: 'NewPass1', confirm: 'NewPass1' }

  it('accepts a valid change', () => {
    expect(errorsOf(changePasswordSchema, valid)).toBeNull()
  })

  it('requires every field', () => {
    expect(errorsOf(changePasswordSchema, { current: '', next: '', confirm: '' })).toEqual({
      current: t('profileSettings.errors.currentPasswordRequired'),
      next: t('resetPassword.chooseANewPassword2'),
      confirm: t('resetPassword.confirmYourNewPassword'),
    })
  })

  it('rejects reusing the current password', () => {
    expect(errorsOf(changePasswordSchema, { current: 'NewPass1', next: 'NewPass1', confirm: 'NewPass1' })).toEqual({
      next: t('profileSettings.errors.passwordSame'),
    })
  })

  it('rejects a mismatched confirmation', () => {
    expect(errorsOf(changePasswordSchema, { ...valid, confirm: 'NewPass2' })).toEqual({
      confirm: t('profileSettings.errors.passwordMismatch'),
    })
  })
})

describe('editProfileSchema', () => {
  const schema = editProfileSchema('ada@example.com')

  it('lower-cases the email', () => {
    expect(parse(schema, { name: 'Ada', email: 'ADA@Example.com', currentPassword: '' })).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      currentPassword: '',
    })
  })

  it('does not need the current password when the email is unchanged (case-insensitively)', () => {
    expect(errorsOf(schema, { name: 'Ada', email: ' Ada@Example.com ', currentPassword: '' })).toBeNull()
  })

  it('requires the current password when the email changes', () => {
    expect(errorsOf(schema, { name: 'Ada', email: 'new@example.com', currentPassword: '' })).toEqual({
      currentPassword: t('profileSettings.errors.currentPasswordRequired'),
    })
    expect(errorsOf(schema, { name: 'Ada', email: 'new@example.com', currentPassword: 'secret' })).toBeNull()
  })

  it('requires a name', () => {
    expect(errorsOf(schema, { name: '', email: 'ada@example.com', currentPassword: '' })).toEqual({
      name: t('profileSettings.errors.nameRequired'),
    })
  })
})

describe('chatMessageSchema', () => {
  it('trims and accepts a message', () => {
    expect(parse(chatMessageSchema, { message: '  hi  ' })).toEqual({ message: 'hi' })
  })

  it('rejects blank and over-long messages', () => {
    expect(errorsOf(chatMessageSchema, { message: '   ' })).not.toBeNull()
    expect(errorsOf(chatMessageSchema, { message: 'a'.repeat(CHAT_MESSAGE_MAX) })).toBeNull()
    expect(errorsOf(chatMessageSchema, { message: 'a'.repeat(CHAT_MESSAGE_MAX + 1) })).not.toBeNull()
  })
})
