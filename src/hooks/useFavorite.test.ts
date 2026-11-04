import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../i18n'
import { exercise } from '../test/fixtures'
import { renderHookWithProviders } from '../test/utils'
import { useFavorite } from './useFavorite'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const auth = vi.hoisted(() => ({ isMember: true }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }))

vi.mock('../services/me', () => ({
  meService: { saved: vi.fn() },
  favoriteService: {
    saveRoutine: vi.fn(),
    unsaveRoutine: vi.fn(),
    saveExercise: vi.fn(),
    unsaveExercise: vi.fn(),
  },
}))

const { favoriteService, meService } = await import('../services/me')

beforeEach(() => {
  auth.isMember = true
  vi.mocked(meService.saved).mockResolvedValue({ routines: [], exercises: [exercise({ id: 10 })] })
  for (const fn of Object.values(favoriteService)) vi.mocked(fn).mockReset().mockResolvedValue({ message: 'ok' })
})

describe('useFavorite', () => {
  it('reads the saved state from the saved list', async () => {
    const { result } = renderHookWithProviders(() => useFavorite('exercise', 10))
    await waitFor(() => expect(result.current.isSaved).toBe(true))
    expect(result.current.canSave).toBe(true)

    const other = renderHookWithProviders(() => useFavorite('routine', 10))
    await waitFor(() => expect(meService.saved).toHaveBeenCalled())
    expect(other.result.current.isSaved).toBe(false)
  })

  it('saves optimistically and refreshes the saved list', async () => {
    const { result, queryClient } = renderHookWithProviders(() => useFavorite('routine', 5))
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    await waitFor(() => expect(meService.saved).toHaveBeenCalled())

    act(() => result.current.toggle())
    expect(result.current.isSaved).toBe(true)
    await waitFor(() => expect(result.current.pending).toBe(false))
    expect(favoriteService.saveRoutine).toHaveBeenCalledWith(5)
    expect(toast.success).toHaveBeenCalledWith(i18n.t('toast.favoriteAdded'))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['me', 'saved'] })
  })

  it('unsaves an already saved exercise', async () => {
    const { result } = renderHookWithProviders(() => useFavorite('exercise', 10))
    await waitFor(() => expect(result.current.isSaved).toBe(true))
    act(() => result.current.toggle())
    expect(result.current.isSaved).toBe(false)
    await waitFor(() => expect(favoriteService.unsaveExercise).toHaveBeenCalledWith(10))
    expect(toast.success).toHaveBeenCalledWith(i18n.t('toast.favoriteRemoved'))
  })

  it('reverts when the request fails', async () => {
    vi.mocked(favoriteService.saveExercise).mockRejectedValue(new Error('down'))
    const { result } = renderHookWithProviders(() => useFavorite('exercise', 11))
    await waitFor(() => expect(meService.saved).toHaveBeenCalled())
    act(() => result.current.toggle())
    expect(result.current.isSaved).toBe(true)
    await waitFor(() => expect(result.current.isSaved).toBe(false))
  })

  it('does nothing for guests and does not load the saved list', () => {
    auth.isMember = false
    const { result } = renderHookWithProviders(() => useFavorite('exercise', 10))
    act(() => result.current.toggle())
    expect(result.current.canSave).toBe(false)
    expect(meService.saved).not.toHaveBeenCalled()
    expect(favoriteService.saveExercise).not.toHaveBeenCalled()
  })

  it('does nothing without an id', async () => {
    const { result } = renderHookWithProviders(() => useFavorite('exercise', undefined))
    act(() => result.current.toggle())
    expect(favoriteService.saveExercise).not.toHaveBeenCalled()
  })
})
