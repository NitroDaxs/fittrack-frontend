import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
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
  const from = location.state?.from ?? '/dashboard'

  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setField = (name) => (event) => {
    const next = { ...values, [name]: event.target.value }
    setValues(next)
    if (touched[name]) setErrors(validate(next))
  }

  const blur = (name) => () => {
    setTouched((t) => ({ ...t, [name]: true }))
    setErrors(validate(values))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ email: true, password: true })
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      // No real authentication -- the mock accepts any valid-looking credentials
      // and infers the role from the email address.
      await login(values)
      navigate(from, { replace: true })
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
              <Link to="/login" className="font-label-sm text-label-sm text-primary hover:text-primary-container">
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

        <div className="mt-lg relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-surface-variant" />
          </div>
          <div className="relative flex justify-center font-label-sm text-label-sm">
            <span className="bg-surface-container-lowest px-2 text-secondary">Or continue with</span>
          </div>
        </div>

        <div className="mt-lg grid grid-cols-2 gap-sm">
          {[
            { icon: 'sports_gymnastics', label: 'Apple' },
            { icon: 'public', label: 'Google' },
          ].map((provider) => (
            <button
              key={provider.label}
              type="button"
              disabled
              title="Social sign-in is not part of this prototype"
              className="flex justify-center items-center py-sm px-md rounded-lg border border-surface-variant bg-surface text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name={provider.icon} size={20} />
              <span className="sr-only">Log in with {provider.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-lg font-label-sm text-label-sm text-secondary text-center leading-4 border-t border-surface-variant pt-md">
          Prototype: any valid email and an 8+ character password will log you in. Use{' '}
          <span className="text-on-surface">alex@fittrack.example</span> for the admin view.
        </p>
      </div>
    </div>
  )
}
