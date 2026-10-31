import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useChangePassword } from '../../hooks/useMe'
import { fieldErrorsOf } from '../../services/http'
import { TextField } from '../ui/Field'

const emptyForm = { current: '', next: '', confirm: '' }

type Values = typeof emptyForm
type Errors = Partial<Record<keyof Values, string>>

export default function ChangePasswordForm() {
  const { t } = useTranslation()
  const changePassword = useChangePassword()
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState<Errors>({})

  const setField = (name: keyof Values) => (event: ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [name]: event.target.value }))

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const found: Errors = {}
    if (!values.current) found.current = t('profileSettings.errors.currentPasswordRequired')
    if (values.next.length < 8 || !/\d/.test(values.next)) found.next = t('profileSettings.errors.passwordRules')
    else if (values.next === values.current) found.next = t('profileSettings.errors.passwordSame')
    if (values.confirm !== values.next) found.confirm = t('profileSettings.errors.passwordMismatch')
    setErrors(found)
    if (Object.keys(found).length > 0) return

    changePassword.mutate(
      { current_password: values.current, new_password: values.next, new_password_confirmation: values.confirm },
      {
        onSuccess: () => {
          setValues(emptyForm)
          toast.success(t('profileSettings.passwordChanged'))
        },
        onError: (error) => {
          const fields = fieldErrorsOf(error)
          setErrors({
            current: fields.current_password ? t('profileSettings.errors.currentPasswordWrong') : undefined,
            next: fields.new_password ? t('profileSettings.errors.passwordRules') : undefined,
            confirm: fields.new_password_confirmation ? t('profileSettings.errors.passwordMismatch') : undefined,
          })
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-md flex flex-col gap-md">
      <div>
        <h3 className="font-label-bold text-label-bold text-on-surface">{t('profileSettings.changePassword')}</h3>
        <p className="font-label-sm text-label-sm text-secondary mt-xs">{t('profileSettings.changePasswordHint')}</p>
      </div>
      <TextField
        label={t('profileSettings.currentPassword')}
        name="current-password"
        type="password"
        icon="lock"
        autoComplete="current-password"
        value={values.current}
        onChange={setField('current')}
        error={errors.current}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <TextField
          label={t('profileSettings.newPassword')}
          name="new-password"
          type="password"
          icon="lock"
          autoComplete="new-password"
          value={values.next}
          onChange={setField('next')}
          error={errors.next}
        />
        <TextField
          label={t('profileSettings.confirmNewPassword')}
          name="confirm-new-password"
          type="password"
          icon="lock"
          autoComplete="new-password"
          value={values.confirm}
          onChange={setField('confirm')}
          error={errors.confirm}
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
