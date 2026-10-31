import type { Units, UserRole } from './shared'

export interface UserDto {
  id: number
  name: string
  email: string
  role: UserRole
  units: Units
  is_active: boolean
  created_at: string
  avatar_url: string | null
}

export interface AuthResponse {
  user: UserDto
  access_token: string
  token_type: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  name: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  password_confirmation: string
}
