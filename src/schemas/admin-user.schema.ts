import * as z from 'zod'
import { email, requiredText } from './shared'

export const adminUserSchema = z.object({
  name: requiredText('common.nameIsRequired'),
  email: email('admin.users.enterAValidEmailAddress'),
  role: z.enum(['Member', 'Admin']),
  status: z.enum(['Active', 'Suspended']),
})

/** Also the `UserForm` the admin service sends (types/admin.ts). */
export type AdminUserValues = z.infer<typeof adminUserSchema>
