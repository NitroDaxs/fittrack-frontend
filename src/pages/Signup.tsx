import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/http'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import { signupSchema, type SignupValues } from '../schemas/signup.schema'
import { PASSWORD_MIN } from '../schemas/shared'

/** 0-4: one point each for length, a number, mixed case and a symbol. */
function strengthOf(password: string) {
  let score = 0
  if (password.length >= PASSWORD_MIN) score++
  if (/[0-9]/.test(password)) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthLabels = ['signup.tooShort', 'signup.weak', 'signup.fair', 'signup.good', 'signup.strong']

export default function Signup() {
  const { t } = useTranslation()
  const { register: registerAccount } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
    mode: 'onTouched',
  })

  const onValid = async ({ name, email, password }: SignupValues) => {
    try {
      await registerAccount({ name, email, password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const password = watch('password')
  const score = strengthOf(password)

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

        <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-lg">
          <TextField
            label={t('signup.fullName')}
            id="name"
            icon="user"
            placeholder="Alex Alexson"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <TextField
            label={t('common.emailAddress')}
            id="email"
            type="email"
            icon="mail"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <div>
            <TextField
              label={t('common.password')}
              id="password"
              type="password"
              icon="lock"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              hint={!password ? t('signup.mustBeAtLeast8Characters') : undefined}
              {...register('password')}
            />
            {password ? (
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
            id="confirm"
            type="password"
            icon="key-round"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register('confirm')}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-xs py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? t('signup.creatingAccount') : t('signup.createAccount')}
            {!isSubmitting ? <Icon name="arrow-right" size={18} /> : null}
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
