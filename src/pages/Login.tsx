import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage, fieldErrorsOf } from '../services/http'
import { TextField } from '../components/ui/Field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Values = { email: string; password: string }
type Errors = Partial<Record<keyof Values, string>>

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (!values.email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'That does not look like a valid email address.'
  if (!values.password) errors.password = 'Enter your password.'
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  return errors
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [values, setValues] = useState<Values>({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    setTouched({ email: true, password: true })
    setFormError(null)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (err) {
      const fields = fieldErrorsOf(err)
      setErrors(fields)
      if (Object.keys(fields).length === 0) setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-bl from-surface-variant via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        <div className="text-center mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">FitTrack</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Log in to track your progress.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-lg">
          <TextField
            label="Email Address"
            name="email"
            type="email"
            icon="mail"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={setField('email')}
            onBlur={blur('email')}
            error={touched.email ? errors.email : undefined}
          />

          <div>
            <div className="flex items-center justify-between mb-xs">
              <label className="block font-label-bold text-label-bold text-on-surface" htmlFor="password">
                Password
              </label>
              <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:text-primary-container">
                Forgot password?
              </Link>
            </div>
            <TextField
              name="password"
              id="password"
              type="password"
              icon="lock"
              placeholder="••••••••"
              autoComplete="current-password"
              value={values.password}
              onChange={setField('password')}
              onBlur={blur('password')}
              error={touched.password ? errors.password : undefined}
            />
          </div>

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
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}
