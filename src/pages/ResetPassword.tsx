import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fieldErrorsOf } from '../services/http'
import { authService } from '../services/auth'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'

type Values = { password: string; confirm: string }
type Errors = Partial<Record<keyof Values, string>>

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (!values.password) errors.password = 'Choose a new password.'
  else if (values.password.length < 8) errors.password = 'Must be at least 8 characters.'
  else if (!/[0-9]/.test(values.password)) errors.password = 'Include at least one number.'

  if (!values.confirm) errors.confirm = 'Confirm your new password.'
  else if (values.confirm !== values.password) errors.confirm = 'Passwords do not match.'

  return errors
}

function Notice({ icon, title, children, action, to }: { icon: string; title: string; children: ReactNode; action: string; to: string }) {
  return (
    <div className="text-center" role="status">
      <Icon name={icon} size={40} className="text-primary mb-sm" />
      <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">{title}</h1>
      <p className="font-body-md text-body-md text-on-surface-variant mb-lg">{children}</p>
      <Link
        to={to}
        className="w-full flex justify-center items-center py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200"
      >
        {action}
      </Link>
    </div>
  )
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')

  const [values, setValues] = useState<Values>({ password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [stage, setStage] = useState<'form' | 'done' | 'invalid'>(token ? 'form' : 'invalid')
  const [formError, setFormError] = useState<string>()

  const setField = (name: keyof Values) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [name]: event.target.value }
    setValues(next)
    if (touched[name]) setErrors(validate(next))
  }

  const blur = (name: keyof Values) => () => {
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors(validate(values))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ password: true, confirm: true })
    setFormError(undefined)
    if (!token || Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await authService.resetPassword({
        token,
        password: values.password,
        password_confirmation: values.confirm,
      })
      setStage('done')
    } catch (err) {
      const fields = fieldErrorsOf(err)
      if (fields.token) {
        setStage('invalid')
      } else if (fields.password || fields.password_confirmation) {
        setErrors({ password: fields.password, confirm: fields.password_confirmation })
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-bl from-surface-variant via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        {stage === 'done' ? (
          <Notice icon="check_circle" title="Password updated" action="Log in" to="/login">
            You can now log in with your new password.
          </Notice>
        ) : stage === 'invalid' ? (
          <Notice icon="link_off" title="This link doesn't work" action="Request a new link" to="/forgot-password">
            Reset links work once and expire after 60 minutes. Request a new one to continue.
          </Notice>
        ) : (
          <>
            <div className="text-center mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">Choose a new password</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Use at least 8 characters, including a number.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-lg">
              <TextField
                label="New Password"
                name="password"
                type="password"
                icon="lock"
                placeholder="••••••••"
                autoComplete="new-password"
                value={values.password}
                onChange={setField('password')}
                onBlur={blur('password')}
                error={touched.password ? errors.password : undefined}
              />
              <TextField
                label="Confirm New Password"
                name="confirm"
                type="password"
                icon="lock"
                placeholder="••••••••"
                autoComplete="new-password"
                value={values.confirm}
                onChange={setField('confirm')}
                onBlur={blur('confirm')}
                error={touched.confirm ? errors.confirm : undefined}
              />

              {formError ? (
                <p role="alert" className="font-label-sm text-label-sm text-error text-center">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
