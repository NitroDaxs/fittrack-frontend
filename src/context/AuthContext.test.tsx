import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../i18n'
import { exercise, userDto } from '../test/fixtures'
import { createTestQueryClient, silenceRenderErrors } from '../test/utils'
import { useUnitStore } from '../store/unit.store'
import { useWorkoutStore } from '../store/workout.store'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const unauthorized = vi.hoisted(() => ({ handler: (() => {}) as () => void }))
vi.mock('../services/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/http')>()),
  setUnauthorizedHandler: (handler: () => void) => {
    unauthorized.handler = handler
  },
}))
vi.mock('../services/auth', () => ({ authService: { login: vi.fn(), register: vi.fn(), logout: vi.fn() } }))
vi.mock('../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/me')>()),
  meService: { profile: vi.fn() },
}))

const { authService } = await import('../services/auth')
const { meService, toProfile } = await import('../services/me')
const { getToken, setToken } = await import('../services/http')

const SESSION_KEY = 'fittrack.user.session'

const setup = () => {
  const queryClient = createTestQueryClient()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
  return { ...renderHook(() => useAuth(), { wrapper }), queryClient }
}

const storeSession = (user = userDto()) => {
  setToken('stored-token')
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user, role: user.role }))
}

beforeEach(() => {
  vi.mocked(authService.login).mockReset()
  vi.mocked(authService.register).mockReset()
  vi.mocked(authService.logout).mockReset().mockResolvedValue({ message: 'bye' })
  // By default the account matches what is stored.
  vi.mocked(meService.profile).mockReset().mockImplementation(() => Promise.resolve(toProfile(userDto())))
  vi.mocked(toast.error).mockClear()
})

describe('useAuth', () => {
  it('throws outside a provider', () => {
    expect(() => silenceRenderErrors(() => renderHook(() => useAuth()))).toThrow(/AuthProvider/)
  })
})

describe('initial session', () => {
  it('is a guest with nothing stored', () => {
    const { result } = setup()
    expect(result.current).toMatchObject({ user: null, role: 'guest', isAuthenticated: false, isMember: false, isAdmin: false })
    expect(meService.profile).not.toHaveBeenCalled()
  })

  it('restores a stored session when a token exists', () => {
    storeSession(userDto({ role: 'admin' }))
    const { result } = setup()
    expect(result.current).toMatchObject({ role: 'admin', isAuthenticated: true, isMember: true, isAdmin: true })
    expect(result.current.user?.email).toBe('ada@example.com')
  })

  it('ignores a stored session without a token', () => {
    storeSession()
    setToken(null)
    expect(setup().result.current.isAuthenticated).toBe(false)
  })

  it('ignores a corrupt stored session', () => {
    setToken('t')
    localStorage.setItem(SESSION_KEY, '{not json')
    expect(setup().result.current.isAuthenticated).toBe(false)
  })
})

describe('login / register / logout', () => {
  it('login stores the token and session', async () => {
    const user = userDto({ name: 'Logged In' })
    vi.mocked(authService.login).mockResolvedValue({ user, access_token: 'tok', token_type: 'Bearer' })
    const { result } = setup()

    let returned
    await act(async () => {
      returned = await result.current.login({ email: 'a@b.co', password: 'x' })
    })
    expect(returned).toEqual(user)
    expect(authService.login).toHaveBeenCalledWith({ email: 'a@b.co', password: 'x' })
    expect(getToken()).toBe('tok')
    expect(result.current.user).toEqual(user)
    expect(JSON.parse(localStorage.getItem(SESSION_KEY)!)).toEqual({ user, role: 'member' })
  })

  it('a failed login leaves the visitor signed out', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Wrong password'))
    const { result } = setup()
    await act(async () => {
      await expect(result.current.login({ email: 'a', password: 'b' })).rejects.toThrow('Wrong password')
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
  })

  it('register starts a session', async () => {
    vi.mocked(authService.register).mockResolvedValue({ user: userDto(), access_token: 'new', token_type: 'Bearer' })
    const { result } = setup()
    await act(async () => {
      await result.current.register({ name: 'Ada', email: 'a@b.co', password: 'Password1' })
    })
    expect(result.current.isMember).toBe(true)
    expect(getToken()).toBe('new')
  })

  it('logout clears everything even when the API call fails', async () => {
    storeSession()
    vi.mocked(authService.logout).mockRejectedValue(new Error('offline'))
    const { result, queryClient } = setup()
    queryClient.setQueryData(['private'], 'secret')

    await act(async () => {
      await result.current.logout()
    })
    expect(result.current.isAuthenticated).toBe(false)
    expect(getToken()).toBeNull()
    expect(localStorage.getItem(SESSION_KEY)).toBeNull()
    expect(queryClient.getQueryData(['private'])).toBeUndefined()
  })

  it('logout clears the workout draft and session', async () => {
    storeSession()
    const workout = useWorkoutStore.getState()
    workout.addExercise(exercise({ id: 1, name: 'Squat' }))
    workout.startSession()
    expect(useWorkoutStore.getState().session).not.toBeNull()
    const { result } = setup()

    await act(async () => {
      await result.current.logout()
    })
    expect(useWorkoutStore.getState().session).toBeNull()
    expect(useWorkoutStore.getState().draft.items).toEqual([])
    expect(JSON.parse(localStorage.getItem('fittrack.workout')!).state.session).toBeNull()
  })
})

describe('expired sessions', () => {
  it('the 401 handler signs out, clears the cache and shows one toast', () => {
    storeSession()
    const { result, queryClient } = setup()
    queryClient.setQueryData(['private'], 'secret')

    act(() => unauthorized.handler())
    expect(result.current.isAuthenticated).toBe(false)
    expect(queryClient.getQueryData(['private'])).toBeUndefined()
    expect(toast.error).toHaveBeenCalledWith(i18n.t('errors.sessionExpired'), { id: 'session-expired' })
  })
})

describe('keeping the session in step', () => {
  it('updates the stored role and details from the profile', async () => {
    storeSession(userDto({ role: 'member' }))
    vi.mocked(meService.profile).mockResolvedValue(toProfile(userDto({ role: 'admin', name: 'Promoted' })))
    const { result } = setup()
    await waitFor(() => expect(result.current.isAdmin).toBe(true))
    expect(result.current.user?.name).toBe('Promoted')
    expect(JSON.parse(localStorage.getItem(SESSION_KEY)!).role).toBe('admin')
  })

  it("adopts the account's unit preference once the profile loads", async () => {
    useUnitStore.getState().setUnit('imperial')
    storeSession()
    vi.mocked(meService.profile).mockResolvedValue(toProfile(userDto({ units: 'metric' })))
    setup()
    await waitFor(() => expect(useUnitStore.getState().unit).toBe('metric'))
  })

  it('leaves a guest unit preference alone', async () => {
    useUnitStore.getState().setUnit('metric')
    setup()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(meService.profile).not.toHaveBeenCalled()
    expect(useUnitStore.getState().unit).toBe('metric')
  })

  it('ignores a profile for a different user', async () => {
    storeSession(userDto({ id: 1 }))
    vi.mocked(meService.profile).mockResolvedValue(toProfile(userDto({ id: 2, role: 'admin' })))
    const { result } = setup()
    await waitFor(() => expect(meService.profile).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(result.current.isAdmin).toBe(false)
  })

  it('follows a login or logout in another tab', () => {
    const { result } = setup()
    expect(result.current.isAuthenticated).toBe(false)

    storeSession()
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY }))
    })
    expect(result.current.isAuthenticated).toBe(true)

    localStorage.removeItem(SESSION_KEY)
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: null }))
    })
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('ignores unrelated storage events', () => {
    const { result } = setup()
    storeSession()
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'units' }))
    })
    expect(result.current.isAuthenticated).toBe(false)
  })
})
