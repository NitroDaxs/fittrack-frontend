import * as z from 'zod'
import { email, msg, newPassword, requiredText } from './shared'

// No minimum length or pattern for the name: real names come in every shape.
export const signupSchema = z
  .object({
    name: requiredText('signup.enterYourFullName'),
    email: email(),
    password: newPassword('signup.chooseAPassword'),
    confirm: z.string().min(1, msg('signup.confirmYourPassword')),
  })
  .refine((values) => values.password === values.confirm, {
    ...msg('common.passwordsDoNotMatch'),
    path: ['confirm'],
  })

export type SignupValues = z.infer<typeof signupSchema>
