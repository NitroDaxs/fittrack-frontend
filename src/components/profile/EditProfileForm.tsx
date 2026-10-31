import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUpdateProfile } from '../../hooks/useMe'
import { fieldErrorsOf } from '../../services/http'
import type { Profile } from '../../types/me'
import { TextField } from '../ui/Field'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Errors = Partial<Record<'name' | 'email' | 'current_password', string>>

export default function EditProfileForm({ profile }: { profile: Profile }) {
  const { t } = useTranslation()
  const update = useUpdateProfile()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()
  const emailChanged = cleanEmail !== profile.email
  const changed = cleanName !== profile.name || emailChanged

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const found: Errors = {}
    if (!cleanName) found.name = t('profileSettings.errors.nameRequired')
    if (!EMAIL_PATTERN.test(cleanEmail)) found.email = t('profileSettings.errors.emailInvalid')
    if (emailChanged && !currentPassword) found.current_password = t('profileSettings.errors.currentPasswordRequired')
    setErrors(found)
    if (Object.keys(found).length > 0) return

    update.mutate(
      {
        name: cleanName,
        email: cleanEmail,
        current_password: emailChanged ? currentPassword : undefined,
      },
      {
        onSuccess: () => {
          setCurrentPassword('')
          toast.success(t('profileSettings.detailsSaved'))
        },
        onError: (error) => {
          const fields = fieldErrorsOf(error)
          setErrors({
            ...fields,
            ...(fields.email ? { email: t('profileSettings.errors.emailTaken') } : {}),
            ...(fields.current_password ? { current_password: t('profileSettings.errors.currentPasswordWrong') } : {}),
          })
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-md flex flex-col gap-md">
      <h3 className="font-label-bold text-label-bold text-on-surface">{t('profileSettings.personalDetails')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <TextField
          label={t('common.name')}
          name="profile-name"
          icon="user"
          autoComplete="name"
          maxLength={255}
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <TextField
          label={t('common.email')}
          name="profile-email"
          type="email"
          icon="mail"
          autoComplete="email"
          maxLength={255}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
      </div>
      {emailChanged ? (
        <TextField
          label={t('profileSettings.currentPassword')}
          name="profile-email-password"
          type="password"
          icon="lock"
          autoComplete="current-password"
          hint={t('profileSettings.emailPasswordHint')}
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          error={errors.current_password}
        />
      ) : null}
      <button
        type="submit"
        disabled={!changed || update.isPending}
        className="self-end bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-lg hover:bg-primary transition-colors disabled:opacity-60 disabled:hover:bg-primary-container"
      >
        {update.isPending ? t('common.saving') : t('profileSettings.saveChanges')}
      </button>
    </form>
  )
}
