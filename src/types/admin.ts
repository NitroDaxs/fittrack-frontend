import type { PageQuery, UserRole } from './shared'
import type { AdminUserValues } from '../schemas/admin-user.schema'

export interface AdminStatsDto {
  totalExercises: number
  exerciseDelta: string
  totalRoutines: number
  routineDelta: string
  publishedArticles: number
  articleDelta: string
  totalUsers: number
  userDelta: string
  apiUptime: number
  storageCapacity: number
}

export interface ActivityDto {
  id: string
  icon: string
  tone: 'primary' | 'secondary' | 'tertiary' | 'neutral'
  text: string
  meta: string
}

export interface AdminUserRequest {
  name: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface AdminUser {
  id: number
  name: string
  email: string
  role: string
  status: string
  joined: string
}

/** The admin form's values, inferred from `adminUserSchema` so there is one source. */
export type UserForm = AdminUserValues

export interface AdminQuery extends PageQuery {
  search?: string
  sort?: string
  dir?: 'asc' | 'desc'
  category?: string
  status?: string
  author?: string
  role?: string
  goal?: string
}
