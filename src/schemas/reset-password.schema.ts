import * as z from 'zod'
import { msg, newPassword } from './shared'

export const resetPasswordSchema = z
  .object({
    password: newPassword('resetPassword.chooseANewPassword2'),
    confirm: z.string().min(1, msg('resetPassword.confirmYourNewPassword')),
  })
  .refine((values) => values.password === values.confirm, {
    ...msg('common.passwordsDoNotMatch'),
    path: ['confirm'],
  })

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
