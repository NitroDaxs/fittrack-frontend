import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { fieldErrorsOf } from '../services/http'
import { authService } from '../services/auth'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email address.'
  if (!EMAIL_PATTERN.test(email)) return 'That does not look like a valid email address.'
  return undefined
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found = validate(email)
    setError(found)
    if (found) return

    setSubmitting(true)
    try {
      await authService.forgotPassword({ email: email.trim() })
      setSent(true)
    } catch (err) {
      setError(fieldErrorsOf(err).email ?? 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-bl from-surface-variant via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        {sent ? (
          <div className="text-center" role="status">
            <Icon name="mail" size={40} className="text-primary mb-sm" />
            <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">Check your email</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              If an account exists for <span className="text-on-surface">{email.trim()}</span>, we&apos;ve sent a link
              to reset your password. It expires in 60 minutes.
            </p>
            <p className="mt-md font-label-sm text-label-sm text-secondary">
              Nothing there? Check your spam folder, or{' '}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="font-label-sm text-label-sm text-primary hover:text-primary-container"
              >
                try again
              </button>{' '}
              in a minute.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">Reset your password</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-lg">
              <TextField
                label="Email Address"
                name="email"
                type="email"
                icon="mail"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={error}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          </>
        )}

        <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
          <Link to="/login" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}
