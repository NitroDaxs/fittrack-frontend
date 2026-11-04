import * as z from 'zod'
import { email, msg, requiredText } from './shared'

/**
 * `originalEmail` is the address on file: the current password is only needed
 * when the email changes, because the email can be used to reset the password.
 */
export const editProfileSchema = (originalEmail: string) =>
  z
    .object({
      name: requiredText('profileSettings.errors.nameRequired'),
      email: email().transform((value) => value.toLowerCase()),
      currentPassword: z.string(),
    })
    .refine((values) => values.email === originalEmail || values.currentPassword.length > 0, {
      ...msg('profileSettings.errors.currentPasswordRequired'),
      path: ['currentPassword'],
    })

export type EditProfileInput = z.input<ReturnType<typeof editProfileSchema>>
export type EditProfileValues = z.output<ReturnType<typeof editProfileSchema>>
