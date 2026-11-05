import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUnitStore } from '../store/unit.store'
import { useSetUnit, useUnitFormat } from './useUnits'

const auth = vi.hoisted(() => ({ isAuthenticated: false }))
const updateProfile = vi.hoisted(() => vi.fn())

vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('./useMe', () => ({ useUpdateProfile: () => ({ mutate: updateProfile }) }))

beforeEach(() => {
  auth.isAuthenticated = false
  updateProfile.mockReset()
})

describe('useUnitFormat', () => {
  it('follows the store', () => {
    const { result } = renderHook(() => useUnitFormat())
    expect(result.current).toMatchObject({ unit: 'imperial', weightLabel: 'lbs' })
    act(() => useUnitStore.getState().setUnit('metric'))
    expect(result.current).toMatchObject({ unit: 'metric', weightLabel: 'kg' })
    expect(result.current.formatWeight(185)).toBe('83.9 kg')
  })

  it('keeps the same helpers while the unit is unchanged', () => {
    const { result, rerender } = renderHook(() => useUnitFormat())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})

describe('useSetUnit', () => {
  it('does not save a guest choice to an account', () => {
    const { result } = renderHook(() => useSetUnit())
    act(() => result.current('metric'))
    expect(useUnitStore.getState().unit).toBe('metric')
    expect(updateProfile).not.toHaveBeenCalled()
  })

  it('saves a signed-in choice to the account', () => {
    auth.isAuthenticated = true
    const { result } = renderHook(() => useSetUnit())
    act(() => result.current('metric'))
    expect(useUnitStore.getState().unit).toBe('metric')
    expect(updateProfile).toHaveBeenCalledWith({ units: 'metric' })
  })
})
