import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useProfile } from '../hooks/useMe'
import i18n from '../i18n'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AuthResponse, LoginRequest, RegisterRequest, UserDto } from '../types/auth'
import type { UserRole } from '../types/shared'
import { getToken, setToken, setUnauthorizedHandler } from '../services/http'
import { authService } from '../services/auth'
import { useWorkoutStore } from '../store/workout.store'

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
      // Several requests can fail at once, so all of them share one toast.
      toast.error(i18n.t('errors.sessionExpired'), { id: 'session-expired' })
    })
    return () => setUnauthorizedHandler(() => {})
  }, [setSession, queryClient])

  // Logging in or out in another tab applies to this one too.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_KEY && event.key !== null) return
      const next = readStoredSession()
      setSessionState(next)
      queryClient.clear()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [queryClient])

  // The stored session can go out of date, for example when an admin changes this
  // user's role, so keep it in step with the account.
  const { data: profile } = useProfile(session !== null)
  useEffect(() => {
    if (!profile || !session || profile.id !== session.user.id) return
    const { user } = session
    if (profile.role === user.role && profile.name === user.name && profile.email === user.email) return
    setSession({ user: { ...user, role: profile.role, name: profile.name, email: profile.email }, role: profile.role })
  }, [profile, session, setSession])

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
      // The same goes for a workout in progress on this device.
      useWorkoutStore.getState().reset()
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
