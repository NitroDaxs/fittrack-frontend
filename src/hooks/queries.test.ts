import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../i18n'
import { userDto } from '../test/fixtures'
import { renderHookWithProviders } from '../test/utils'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('../services/admin', () => ({
  adminService: { stats: vi.fn(), activity: vi.fn(), exercises: { list: vi.fn() } },
}))
vi.mock('../services/articles', () => ({ articleService: { list: vi.fn(), show: vi.fn() } }))
vi.mock('../services/exercises', () => ({ exerciseService: { list: vi.fn(), show: vi.fn() } }))
vi.mock('../services/routines', () => ({ routineService: { list: vi.fn(), show: vi.fn() } }))
vi.mock('../services/taxonomies', () => ({ taxonomyService: { taxonomies: vi.fn() } }))
vi.mock('../services/calculators', () => ({
  calculatorService: { oneRepMax: vi.fn(), bmi: vi.fn(), tdee: vi.fn(), macros: vi.fn(), bodyFat: vi.fn() },
}))
vi.mock('../services/http', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/http')>()),
  setToken: vi.fn(),
}))
vi.mock('../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/me')>()),
  meService: {
    profile: vi.fn(),
    saved: vi.fn(),
    dashboard: vi.fn(),
    measurements: vi.fn(),
    workouts: vi.fn(),
    workout: vi.fn(),
    logWorkout: vi.fn(),
    logMeasurement: vi.fn(),
    uploadAvatar: vi.fn(),
    removeAvatar: vi.fn(),
    changePassword: vi.fn(),
    updateProfile: vi.fn(),
  },
}))

const { adminService } = await import('../services/admin')
const { articleService } = await import('../services/articles')
const { exerciseService } = await import('../services/exercises')
const { routineService } = await import('../services/routines')
const { taxonomyService } = await import('../services/taxonomies')
const { calculatorService } = await import('../services/calculators')
const { setToken } = await import('../services/http')
const { meService } = await import('../services/me')

const { useAdminActivity, useAdminExercisePicker, useAdminStats } = await import('./useAdmin')
const { useArticle, useArticles } = await import('./useArticles')
const { useExercise, useExercises } = await import('./useExercises')
const { useRoutine, useRoutines } = await import('./useRoutines')
const { useTaxonomies } = await import('./useTaxonomies')
const calculatorHooks = await import('./useCalculators')
const me = await import('./useMe')

beforeEach(() => {
  vi.mocked(toast.success).mockClear()
})

describe('catalog queries', () => {
  it('useExercises passes the query and abort signal, and can be disabled', async () => {
    vi.mocked(exerciseService.list).mockResolvedValue({ data: [], meta: { total: 0, page: 1, perPage: 10, lastPage: 1 } })
    const { result } = renderHookWithProviders(() => useExercises({ search: 'x' }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(exerciseService.list).toHaveBeenCalledWith({ search: 'x' }, expect.any(AbortSignal))

    vi.mocked(exerciseService.list).mockClear()
    renderHookWithProviders(() => useExercises({ search: 'y' }, false))
    expect(exerciseService.list).not.toHaveBeenCalled()
  })

  it('useExercise / useRoutine / useArticle load by key', async () => {
    vi.mocked(exerciseService.show).mockResolvedValue({ name: 'E' } as never)
    vi.mocked(routineService.show).mockResolvedValue({ title: 'R' } as never)
    vi.mocked(articleService.show).mockResolvedValue({ title: 'A' } as never)
    const e = renderHookWithProviders(() => useExercise('e'))
    const r = renderHookWithProviders(() => useRoutine('r'))
    const a = renderHookWithProviders(() => useArticle('a'))
    await waitFor(() => expect(e.result.current.data).toEqual({ name: 'E' }))
    await waitFor(() => expect(r.result.current.data).toEqual({ title: 'R' }))
    await waitFor(() => expect(a.result.current.data).toEqual({ title: 'A' }))
    expect(exerciseService.show).toHaveBeenCalledWith('e')
    expect(routineService.show).toHaveBeenCalledWith('r')
    expect(articleService.show).toHaveBeenCalledWith('a')
  })

  it('useRoutines / useArticles pass the query', async () => {
    vi.mocked(routineService.list).mockResolvedValue({ data: [] } as never)
    vi.mocked(articleService.list).mockResolvedValue({ data: [] } as never)
    renderHookWithProviders(() => useRoutines({ levels: ['beginner'] }))
    renderHookWithProviders(() => useArticles({ category: 'nutrition' }))
    await waitFor(() => expect(routineService.list).toHaveBeenCalledWith({ levels: ['beginner'] }, expect.any(AbortSignal)))
    await waitFor(() => expect(articleService.list).toHaveBeenCalledWith({ category: 'nutrition' }, expect.any(AbortSignal)))
  })

  it('useTaxonomies is null until loaded', async () => {
    vi.mocked(taxonomyService.taxonomies).mockResolvedValue({ authors: ['A'] } as never)
    const { result } = renderHookWithProviders(() => useTaxonomies())
    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).toEqual({ authors: ['A'] }))
  })
})

describe('admin queries', () => {
  it('load stats and activity', async () => {
    vi.mocked(adminService.stats).mockResolvedValue({ totalUsers: 3 } as never)
    vi.mocked(adminService.activity).mockResolvedValue([])
    const stats = renderHookWithProviders(() => useAdminStats())
    const activity = renderHookWithProviders(() => useAdminActivity())
    await waitFor(() => expect(stats.result.current.data).toEqual({ totalUsers: 3 }))
    await waitFor(() => expect(activity.result.current.data).toEqual([]))
  })

  it('the exercise picker waits for two characters', async () => {
    vi.mocked(adminService.exercises.list).mockResolvedValue({ data: [] } as never)
    renderHookWithProviders(() => useAdminExercisePicker(' a '))
    expect(adminService.exercises.list).not.toHaveBeenCalled()
    renderHookWithProviders(() => useAdminExercisePicker('ab'))
    await waitFor(() =>
      expect(adminService.exercises.list).toHaveBeenCalledWith({ search: 'ab', perPage: 6 }, expect.any(AbortSignal)),
    )
  })
})

describe('calculator mutations', () => {
  it.each([
    ['useOneRepMax', 'oneRepMax'],
    ['useBmi', 'bmi'],
    ['useTdee', 'tdee'],
    ['useMacros', 'macros'],
    ['useBodyFat', 'bodyFat'],
  ] as const)('%s calls calculatorService.%s', async (hook, method) => {
    vi.mocked(calculatorService[method]).mockResolvedValue({ value: 1 } as never)
    const { result } = renderHookWithProviders(() => calculatorHooks[hook]())
    act(() => result.current.mutate({ any: 'body' } as never))
    await waitFor(() => expect(result.current.data).toEqual({ value: 1 }))
    expect(vi.mocked(calculatorService[method]).mock.calls[0][0]).toEqual({ any: 'body' })
  })
})

describe('me queries', () => {
  it('useProfile and useSaved can be disabled', () => {
    renderHookWithProviders(() => me.useProfile(false))
    renderHookWithProviders(() => me.useSaved(false))
    expect(meService.profile).not.toHaveBeenCalled()
    expect(meService.saved).not.toHaveBeenCalled()
  })

  it('useWorkout waits for an id', async () => {
    vi.mocked(meService.workout).mockResolvedValue({ id: 4 } as never)
    renderHookWithProviders(() => me.useWorkout(null))
    expect(meService.workout).not.toHaveBeenCalled()
    const { result } = renderHookWithProviders(() => me.useWorkout(4))
    await waitFor(() => expect(result.current.data).toEqual({ id: 4 }))
    expect(meService.workout).toHaveBeenCalledWith(4)
  })

  it('useWorkouts, useDashboard and useMeasurements load their data', async () => {
    vi.mocked(meService.workouts).mockResolvedValue({ data: [] } as never)
    vi.mocked(meService.dashboard).mockResolvedValue({ stats: {} } as never)
    vi.mocked(meService.measurements).mockResolvedValue([])
    const w = renderHookWithProviders(() => me.useWorkouts({ range: '7d' }))
    const d = renderHookWithProviders(() => me.useDashboard())
    const m = renderHookWithProviders(() => me.useMeasurements())
    await waitFor(() => expect(w.result.current.isSuccess && d.result.current.isSuccess && m.result.current.isSuccess).toBe(true))
    expect(meService.workouts).toHaveBeenCalledWith({ range: '7d' }, expect.any(AbortSignal))
  })
})

describe('me mutations', () => {
  it.each([
    ['useLogWorkout', 'logWorkout', 'toast.workoutSaved'],
    ['useLogMeasurement', 'logMeasurement', 'toast.measurementSaved'],
  ] as const)('%s toasts and refreshes everything personal', async (hook, method, toastKey) => {
    vi.mocked(meService[method]).mockResolvedValue({} as never)
    const { result, queryClient } = renderHookWithProviders(() => me[hook]())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    act(() => result.current.mutate({} as never))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(toast.success).toHaveBeenCalledWith(i18n.t(toastKey))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['me'] })
  })

  it.each(['useUploadAvatar', 'useRemoveAvatar', 'useUpdateProfile'] as const)('%s puts the returned user into the profile cache', async (hook) => {
    const method = ({ useUploadAvatar: 'uploadAvatar', useRemoveAvatar: 'removeAvatar', useUpdateProfile: 'updateProfile' } as const)[hook]
    vi.mocked(meService[method]).mockResolvedValue(userDto({ name: 'Updated' }))
    const { result, queryClient } = renderHookWithProviders(() => me[hook]())
    act(() => result.current.mutate({} as never))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(['me', 'profile'])).toMatchObject({ name: 'Updated' })
  })

  it('useChangePassword stores the new token and updates the profile', async () => {
    vi.mocked(meService.changePassword).mockResolvedValue({ user: userDto({ name: 'New' }), access_token: 'fresh', token_type: 'Bearer' })
    const { result, queryClient } = renderHookWithProviders(() => me.useChangePassword())
    act(() => result.current.mutate({ current_password: 'a', new_password: 'B1bbbbbb', new_password_confirmation: 'B1bbbbbb' }))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(setToken).toHaveBeenCalledWith('fresh')
    expect(queryClient.getQueryData(['me', 'profile'])).toMatchObject({ name: 'New' })
  })
})
