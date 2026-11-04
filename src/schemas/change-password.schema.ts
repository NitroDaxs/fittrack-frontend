import * as z from 'zod'
import { msg, newPassword } from './shared'

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, msg('profileSettings.errors.currentPasswordRequired')),
    next: newPassword('resetPassword.chooseANewPassword2'),
    confirm: z.string().min(1, msg('resetPassword.confirmYourNewPassword')),
  })
  .refine((values) => values.next !== values.current, {
    ...msg('profileSettings.errors.passwordSame'),
    path: ['next'],
  })
  .refine((values) => values.next === values.confirm, {
    ...msg('profileSettings.errors.passwordMismatch'),
    path: ['confirm'],
  })

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>
