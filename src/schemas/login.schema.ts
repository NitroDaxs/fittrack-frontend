import * as z from 'zod'
import { email, msg } from './shared'

// Only "was a password typed": accounts made under older password rules must still log in.
export const loginSchema = z.object({
  email: email(),
  password: z.string().min(1, msg('login.enterYourPassword')),
})

export type LoginValues = z.infer<typeof loginSchema>
