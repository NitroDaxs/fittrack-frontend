import * as z from 'zod'
import { email } from './shared'

export const forgotPasswordSchema = z.object({
  email: email(),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
