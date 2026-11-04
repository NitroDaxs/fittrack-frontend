import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { silenceRenderErrors } from '../test/utils'
import { UnitProvider, useUnits } from './UnitContext'

const auth = vi.hoisted(() => ({ isAuthenticated: false }))
const profile = vi.hoisted(() => ({ data: undefined as { units: 'imperial' | 'metric' } | undefined }))
const updateProfile = vi.hoisted(() => vi.fn())
const useProfile = vi.hoisted(() => vi.fn())

vi.mock('./AuthContext', () => ({ useAuth: () => auth }))
vi.mock('../hooks/useMe', () => ({
  useProfile: (enabled: boolean) => {
    useProfile(enabled)
    return profile
  },
  useUpdateProfile: () => ({ mutate: updateProfile }),
}))

const wrapper = ({ children }: { children: ReactNode }) => <UnitProvider>{children}</UnitProvider>
const setup = () => renderHook(() => useUnits(), { wrapper })

beforeEach(() => {
  auth.isAuthenticated = false
  profile.data = undefined
  updateProfile.mockReset()
  useProfile.mockReset()
})

describe('useUnits', () => {
  it('throws outside a provider', () => {
    expect(() => silenceRenderErrors(() => renderHook(() => useUnits()))).toThrow(/UnitProvider/)
  })
})

describe('preference', () => {
  it('defaults to imperial', () => {
    const { result } = setup()
    expect(result.current).toMatchObject({ unit: 'imperial', isMetric: false, weightLabel: 'lbs', lengthLabel: 'in' })
  })

  it('reads and writes the localStorage mirror', () => {
    localStorage.setItem('units', 'metric')
    const { result } = setup()
    expect(result.current.unit).toBe('metric')
    act(() => result.current.setUnit('imperial'))
    expect(localStorage.getItem('units')).toBe('imperial')
  })

  it('ignores junk in storage', () => {
    localStorage.setItem('units', 'furlongs')
    expect(setup().result.current.unit).toBe('imperial')
  })

  it('does not save a guest choice to an account', () => {
    const { result } = setup()
    act(() => result.current.setUnit('metric'))
    expect(result.current.unit).toBe('metric')
    expect(updateProfile).not.toHaveBeenCalled()
    expect(useProfile).toHaveBeenCalledWith(false)
  })

  it('saves a signed-in choice to the account', () => {
    auth.isAuthenticated = true
    const { result } = setup()
    act(() => result.current.setUnit('metric'))
    expect(updateProfile).toHaveBeenCalledWith({ units: 'metric' })
    expect(useProfile).toHaveBeenCalledWith(true)
  })

  it("adopts the account's preference once loaded", () => {
    auth.isAuthenticated = true
    const { result, rerender } = setup()
    expect(result.current.unit).toBe('imperial')
    profile.data = { units: 'metric' }
    rerender()
    expect(result.current.unit).toBe('metric')
    expect(localStorage.getItem('units')).toBe('metric')
  })
})

describe('conversions', () => {
  it('imperial shows stored values as they are (rounded to 0.1)', () => {
    const { result } = setup()
    expect(result.current.showWeight(180.04)).toBe(180)
    expect(result.current.showLength('32.56')).toBe(32.6)
    expect(result.current.toStoredWeight('200')).toBe(200)
    expect(result.current.toStoredLength(30)).toBe(30)
    expect(result.current.formatWeight(180)).toBe('180 lbs')
    expect(result.current.formatLength(32)).toBe('32 in')
  })

  it('metric converts on the way in and out', () => {
    localStorage.setItem('units', 'metric')
    const { result } = setup()
    expect(result.current.showWeight(185)).toBe(83.9)
    expect(result.current.showLength(10)).toBe(25.4)
    expect(result.current.toStoredWeight(100)).toBe(220.5)
    expect(result.current.toStoredLength(254)).toBe(100)
    expect(result.current.formatWeight(185)).toBe('83.9 kg')
    expect(result.current.formatLength(10)).toBe('25.4 cm')
  })

  it.each([null, undefined, ''])('treats %j as missing', (value) => {
    const { result } = setup()
    expect(result.current.showWeight(value)).toBeNull()
    expect(result.current.showLength(value)).toBeNull()
    expect(result.current.toStoredWeight(value)).toBeNull()
    expect(result.current.toStoredLength(value)).toBeNull()
    expect(result.current.formatWeight(value)).toBe('—')
    expect(result.current.formatLength(value)).toBe('—')
  })

  it('keeps zero as a real value', () => {
    expect(setup().result.current.formatWeight(0)).toBe('0 lbs')
  })
})
