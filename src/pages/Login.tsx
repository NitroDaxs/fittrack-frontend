import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/http'
import { TextField } from '../components/ui/Field'
import { loginSchema, type LoginValues } from '../schemas/login.schema'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  })

  const onValid = async (values: LoginValues) => {
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-bl from-surface-variant via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        <div className="text-center mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">FitTrack</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{t('login.logInToTrackYourProgress')}</p>
        </div>

        <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-lg">
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
            <div className="flex items-center justify-between mb-xs">
              <label className="block font-label-bold text-label-bold text-on-surface" htmlFor="password">
                {t('common.password')}
              </label>
              <Link to="/forgot-password" className="font-label-sm text-label-sm text-primary hover:text-primary-container">
                {t('login.forgotPassword')}
              </Link>
            </div>
            <TextField
              id="password"
              type="password"
              icon="lock"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
          >
            {isSubmitting ? t('login.loggingIn') : t('common.logIn')}
          </button>
        </form>

        <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
          {t('login.donTHaveAnAccount')}{' '}
          <Link to="/signup" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            {t('login.signUp')}
          </Link>
        </p>
      </div>
    </div>
  )
}
