import type { PageQuery, UserRole } from './shared'

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

export interface UserForm {
  name: string
  email: string
  role: string
  status: string
}

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
