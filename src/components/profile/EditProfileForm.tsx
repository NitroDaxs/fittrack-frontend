import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useUpdateProfile } from '../../hooks/useMe'
import type { Profile } from '../../types/me'
import { TextField } from '../ui/Field'
import { editProfileSchema, type EditProfileInput, type EditProfileValues } from '../../schemas/edit-profile.schema'

export default function EditProfileForm({ profile }: { profile: Profile }) {
  const { t } = useTranslation()
  const update = useUpdateProfile()
  const schema = useMemo(() => editProfileSchema(profile.email), [profile.email])

  const {
    register,
    handleSubmit,
    resetField,
    watch,
    formState: { errors },
  } = useForm<EditProfileInput, unknown, EditProfileValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { name: profile.name, email: profile.email, currentPassword: '' },
  })

  // The password box appears as soon as the email differs from the one on file.
  const emailChanged = watch('email').trim().toLowerCase() !== profile.email

  // A taken email or a wrong password comes back from the server as a toast.
  const onValid = ({ name, email, currentPassword }: EditProfileValues) =>
    update.mutate(
      { name, email, current_password: email !== profile.email ? currentPassword : undefined },
      {
        onSuccess: () => {
          resetField('currentPassword')
          toast.success(t('profileSettings.detailsSaved'))
        },
      },
    )

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="p-md flex flex-col gap-md">
      <h3 className="font-label-bold text-label-bold text-on-surface">{t('profileSettings.personalDetails')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        <TextField
          id="profile-name"
          label={t('common.name')}
          icon="user"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          id="profile-email"
          label={t('common.email')}
          type="email"
          icon="mail"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      {emailChanged ? (
        <TextField
          id="profile-email-password"
          label={t('profileSettings.currentPassword')}
          type="password"
          icon="lock"
          autoComplete="current-password"
          hint={t('profileSettings.emailPasswordHint')}
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
      ) : null}
      <button
        type="submit"
        // Only disabled while saving, when the label says why. Saving unchanged
        // details is harmless and confirms them, so it is not blocked.
        disabled={update.isPending}
        className="self-end bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-sm rounded-lg hover:bg-primary transition-colors disabled:opacity-60 disabled:hover:bg-primary-container"
      >
        {update.isPending ? t('common.saving') : t('profileSettings.saveChanges')}
      </button>
    </form>
  )
}
