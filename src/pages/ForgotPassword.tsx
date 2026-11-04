import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { errorMessage } from '../services/http'
import { authService } from '../services/auth'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas/forgot-password.schema'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  })

  const onValid = async ({ email }: ForgotPasswordValues) => {
    try {
      await authService.forgotPassword({ email })
      setSentTo(email)
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-bl from-surface-variant via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        {sentTo ? (
          <div className="text-center" role="status">
            <Icon name="mail" size={40} className="text-primary mb-sm" />
            <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">{t('forgotPassword.checkYourEmail')}</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {t('forgotPassword.ifAnAccountExistsFor')}{' '}<span className="text-on-surface">{sentTo}</span>{t('forgotPassword.weVeSentALinkTo')}
            </p>
            <p className="mt-md font-label-sm text-label-sm text-secondary">
              {t('forgotPassword.nothingThereCheckYourSpamFolder')}{' '}
              <button
                type="button"
                onClick={() => setSentTo(null)}
                className="font-label-sm text-label-sm text-primary hover:text-primary-container"
              >
                {t('forgotPassword.tryAgain')}
              </button>{' '}
              {t('forgotPassword.inAMinute')}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">{t('forgotPassword.resetYourPassword')}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('forgotPassword.enterYourEmailAndWeLl')}
              </p>
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? t('forgotPassword.sending') : t('forgotPassword.sendResetLink')}
              </button>
            </form>
          </>
        )}

        <p className="mt-lg text-center font-body-md text-body-md text-on-surface-variant">
          <Link to="/login" className="font-label-bold text-label-bold text-primary hover:text-primary-container">
            {t('forgotPassword.backToLogIn')}
          </Link>
        </p>
      </div>
    </div>
  )
}
