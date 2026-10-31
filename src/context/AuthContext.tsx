import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../types/auth'
import type { UserRole } from '../types/shared'
import { getToken, setToken, setUnauthorizedHandler } from '../services/http'
import { authService } from '../services/auth'

interface Session {
  user: UserDto
  role: UserRole
}

interface AuthContextValue {
  user: UserDto | null
  role: UserRole | 'guest'
  isAuthenticated: boolean
  isMember: boolean
  isAdmin: boolean
  login: (credentials: LoginRequest) => Promise<UserDto>
  register: (details: RegisterRequest) => Promise<UserDto>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const SESSION_KEY = 'fittrack.user.session'

function readStoredSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw && getToken() ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSessionState] = useState<Session | null>(readStoredSession)

  const setSession = useCallback((next: Session | null) => {
    setSessionState(next)
    try {
      if (next) window.localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      else window.localStorage.removeItem(SESSION_KEY)
    } catch {
      /* storage unavailable -- the session stays in memory */
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setSession(null)
      queryClient.clear()
    })
    return () => setUnauthorizedHandler(() => {})
  }, [setSession, queryClient])

  const start = useCallback(
    ({ user, access_token }: AuthResponse) => {
      setToken(access_token)
      setSession({ user, role: user.role })
      return user
    },
    [setSession],
  )

  const login = useCallback((credentials: LoginRequest) => authService.login(credentials).then(start), [start])
  const register = useCallback((details: RegisterRequest) => authService.register(details).then(start), [start])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      /* the token is discarded below either way */
    } finally {
      setSession(null)
      setToken(null)
      // Otherwise the next person to log in on this browser would see this user's data.
      queryClient.clear()
    }
  }, [setSession, queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      role: session?.role ?? 'guest',
      isAuthenticated: session !== null,
      isMember: session !== null,
      isAdmin: session?.role === 'admin',
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
