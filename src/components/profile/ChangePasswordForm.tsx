import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useChangePassword } from '../../hooks/useMe'
import { TextField } from '../ui/Field'
import { changePasswordSchema, type ChangePasswordValues } from '../../schemas/change-password.schema'

const emptyForm: ChangePasswordValues = { current: '', next: '', confirm: '' }

export default function ChangePasswordForm() {
  const { t } = useTranslation()
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: emptyForm,
  })

  // A wrong current password comes back from the server and is shown as a toast.
  const onValid = ({ current, next, confirm }: ChangePasswordValues) =>
    changePassword.mutate(
      { current_password: current, new_password: next, new_password_confirmation: confirm },
      {
        onSuccess: () => {
          reset(emptyForm)
          toast.success(t('profileSettings.passwordChanged'))
        },
      },
    )

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="p-md flex flex-col gap-md">
      <div>
        <h3 className="font-label-bold text-label-bold text-on-surface">{t('profileSettings.changePassword')}</h3>
        <p className="font-label-sm text-label-sm text-secondary mt-xs">{t('profileSettings.changePasswordHint')}</p>
      </div>
      <TextField
        id="current-password"
        label={t('profileSettings.currentPassword')}
        type="password"
        icon="lock"
        autoComplete="current-password"
        error={errors.current?.message}
        {...register('current')}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <TextField
          id="new-password"
          label={t('profileSettings.newPassword')}
          type="password"
          icon="lock"
          autoComplete="new-password"
          hint={t('profileSettings.errors.passwordRules')}
          error={errors.next?.message}
          {...register('next')}
        />
        <TextField
          id="confirm-new-password"
          label={t('profileSettings.confirmNewPassword')}
          type="password"
          icon="lock"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />
      </div>
      <button
        type="submit"
        disabled={changePassword.isPending}
        className="self-end bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-lg hover:bg-primary transition-colors disabled:opacity-60"
      >
        {changePassword.isPending ? t('common.saving') : t('profileSettings.updatePassword')}
      </button>
    </form>
  )
}
