import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Enter your full name.'
  else if (values.name.trim().length < 2) errors.name = 'That name looks too short.'

  if (!values.email.trim()) errors.email = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = 'That does not look like a valid email address.'

  if (!values.password) errors.password = 'Choose a password.'
  else if (values.password.length < 8) errors.password = 'Must be at least 8 characters.'
  else if (!/[0-9]/.test(values.password)) errors.password = 'Include at least one number.'

  if (!values.confirm) errors.confirm = 'Confirm your password.'
  else if (values.confirm !== values.password) errors.confirm = 'Passwords do not match.'

  return errors
}

function strengthOf(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[0-9]/.test(password)) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
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
    setTouched({ name: true, email: true, password: true, confirm: true })
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await register(values)
      navigate('/dashboard', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  const score = strengthOf(values.password)

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-primary-fixed via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        <div className="text-center mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">FitTrack</h1>
          <h2 className="font-headline-md text-headline-md text-on-surface">Create your account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Start your high-performance journey today.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-lg">
          <TextField
            label="Full Name"
            name="name"
            icon="person"
            placeholder="Alex Alexson"
            autoComplete="name"
            value={values.name}
            onChange={setField('name')}
            onBlur={blur('name')}
            error={touched.name ? errors.name : undefined}
          />
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
            <TextField
              label="Password"
              name="password"
              type="password"
              icon="lock"
              placeholder="••••••••"
              autoComplete="new-password"
              value={values.password}
              onChange={setField('password')}
              onBlur={blur('password')}
              error={touched.password ? errors.password : undefined}
              hint={!values.password ? 'Must be at least 8 characters and include a number.' : undefined}
            />
            {values.password ? (
              <div className="mt-sm">
                <div className="flex gap-xs" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < score ? (score >= 3 ? 'bg-primary' : 'bg-primary-fixed-dim') : 'bg-surface-variant'
                      }`}
                    />
                  ))}
                </div>
                <p className="font-label-sm text-label-sm text-secondary mt-xs">
                  Password strength: {strengthLabels[score]}
                </p>
              </div>
            ) : null}
          </div>
          <TextField
            label="Confirm Password"
            name="confirm"
            type="password"
            icon="lock_reset"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.confirm}
            onChange={setField('confirm')}
            onBlur={blur('confirm')}
            error={touched.confirm ? errors.confirm : undefined}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-xs py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
            {!submitting ? <Icon name="arrow_forward" size={18} /> : null}
          </button>
        </form>

        <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            Log in
          </Link>
        </p>

        <p className="mt-lg font-label-sm text-label-sm text-secondary text-center leading-4 border-t border-surface-variant pt-md">
          Prototype: validation runs in the browser only. No account is created and nothing is sent anywhere.
        </p>
      </div>
    </div>
  )
}
