import { endpoints } from './endpoints'
import { post } from './http'
import type { AuthResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from '../types/auth'
import type { MessageResponse } from '../types/shared'

export const authService = {
  login: (body: LoginRequest) => post<AuthResponse>(endpoints.auth.login, body),
  register: (body: RegisterRequest) => post<AuthResponse>(endpoints.auth.register, body),
  forgotPassword: (body: { email: string }) => post<MessageResponse>(endpoints.auth.forgotPassword, body),
  resetPassword: (body: ResetPasswordRequest) => post<MessageResponse>(endpoints.auth.resetPassword, body),
  logout: () => post<MessageResponse>(endpoints.auth.logout),
}
