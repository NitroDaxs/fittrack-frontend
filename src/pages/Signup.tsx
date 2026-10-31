import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage, fieldErrorsOf } from '../services/http'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Values = { name: string; email: string; password: string; confirm: string }
type Errors = Partial<Record<keyof Values, string>>

function validate(values: Values): Errors {
  const errors: Errors = {}
  if (!values.name.trim()) errors.name = i18n.t('signup.enterYourFullName')
  else if (values.name.trim().length < 2) errors.name = i18n.t('signup.thatNameLooksTooShort')

  if (!values.email.trim()) errors.email = i18n.t('common.enterYourEmailAddress')
  else if (!EMAIL_PATTERN.test(values.email)) errors.email = i18n.t('common.thatDoesNotLookLikeA')

  if (!values.password) errors.password = i18n.t('signup.chooseAPassword')
  else if (values.password.length < 8) errors.password = i18n.t('common.mustBeAtLeast8Characters')
  else if (!/[0-9]/.test(values.password)) errors.password = i18n.t('common.includeAtLeastOneNumber')

  if (!values.confirm) errors.confirm = i18n.t('signup.confirmYourPassword')
  else if (values.confirm !== values.password) errors.confirm = i18n.t('common.passwordsDoNotMatch')

  return errors
}

function strengthOf(password: string) {
  let score = 0
  if (password.length >= 8) score++
  if (/[0-9]/.test(password)) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['signup.tooShort', 'signup.weak', 'signup.fair', 'signup.good', 'signup.strong']

export default function Signup() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' })
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
    setTouched({ name: true, email: true, password: true, confirm: true })
    setFormError(null)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await register({ name: values.name, email: values.email, password: values.password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const fields = fieldErrorsOf(err)
      setErrors(fields)
      if (Object.keys(fields).length === 0) setFormError(errorMessage(err))
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
          <h2 className="font-headline-md text-headline-md text-on-surface">{t('signup.createYourAccount')}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            {t('signup.startYourHighPerformanceJourneyToday')}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-lg">
          <TextField
            label={t('signup.fullName')}
            name="name"
            icon="user"
            placeholder="Alex Alexson"
            autoComplete="name"
            value={values.name}
            onChange={setField('name')}
            onBlur={blur('name')}
            error={touched.name ? errors.name : undefined}
          />
          <TextField
            label={t('common.emailAddress')}
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
              label={t('common.password')}
              name="password"
              type="password"
              icon="lock"
              placeholder="••••••••"
              autoComplete="new-password"
              value={values.password}
              onChange={setField('password')}
              onBlur={blur('password')}
              error={touched.password ? errors.password : undefined}
              hint={!values.password ? t('signup.mustBeAtLeast8Characters') : undefined}
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
                  {t('signup.passwordStrength', { value: t(strengthLabels[score]) })}
                </p>
              </div>
            ) : null}
          </div>
          <TextField
            label={t('signup.confirmPassword')}
            name="confirm"
            type="password"
            icon="key-round"
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
            className="w-full flex justify-center items-center gap-xs py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? t('signup.creatingAccount') : t('signup.createAccount')}
            {!submitting ? <Icon name="arrow-right" size={18} /> : null}
          </button>
        </form>

        <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
          {t('signup.alreadyHaveAnAccount')}{' '}
          <Link to="/login" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            {t('common.logIn')}
          </Link>
        </p>

      </div>
    </div>
  )
}
