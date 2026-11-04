import { useTranslation } from 'react-i18next'
import type { IconName } from '../components/ui/Icon'
import { useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { errorMessage, fieldErrorsOf } from '../services/http'
import { authService } from '../services/auth'
import { TextField } from '../components/ui/Field'
import Icon from '../components/ui/Icon'
import { resetPasswordSchema, type ResetPasswordValues } from '../schemas/reset-password.schema'

function Notice({ icon, title, children, action, to }: { icon: IconName; title: string; children: ReactNode; action: string; to: string }) {
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
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [stage, setStage] = useState<'form' | 'done' | 'invalid'>(token ? 'form' : 'invalid')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirm: '' },
    mode: 'onTouched',
  })

  const onValid = async ({ password, confirm }: ResetPasswordValues) => {
    if (!token) return
    try {
      await authService.resetPassword({ token, password, password_confirmation: confirm })
      setStage('done')
    } catch (err) {
      // An expired or used link gets its own screen; anything else is a toast.
      if (fieldErrorsOf(err).token) setStage('invalid')
      else toast.error(errorMessage(err))
    }
  }

  return (
    <div className="flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden min-h-[calc(100vh-160px)]">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-bl from-surface-variant via-surface to-surface" />

      <div className="w-full max-w-md bg-surface-container-lowest elev-card rounded-xl p-lg md:p-xl relative z-10 border border-surface-variant/50">
        {stage === 'done' ? (
          <Notice icon="circle-check" title={t('resetPassword.passwordUpdated')} action={t('common.logIn')} to="/login">
            {t('resetPassword.youCanNowLogInWith')}
          </Notice>
        ) : stage === 'invalid' ? (
          <Notice icon="unlink" title={t('resetPassword.thisLinkDoesnTWork')} action={t('resetPassword.requestANewLink')} to="/forgot-password">
            {t('resetPassword.resetLinksWorkOnceAndExpire')}
          </Notice>
        ) : (
          <>
            <div className="text-center mb-xl">
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-sm">{t('resetPassword.chooseANewPassword')}</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('resetPassword.useAtLeast8CharactersIncluding')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-lg">
              <TextField
                label={t('resetPassword.newPassword')}
                id="password"
                type="password"
                icon="lock"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <TextField
                label={t('resetPassword.confirmNewPassword')}
                id="confirm"
                type="password"
                icon="lock"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirm?.message}
                {...register('confirm')}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? t('resetPassword.updating') : t('resetPassword.updatePassword')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
