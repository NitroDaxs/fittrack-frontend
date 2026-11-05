import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useQueryParams } from './useQueryParams'

function setup(initial = '/') {
  const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter initialEntries={[initial]}>{children}</MemoryRouter>
  return renderHook(() => ({ ...useQueryParams(), location: useLocation() }), { wrapper })
}

describe('useQueryParams', () => {
  it('parses strings, lists and numbers from the URL', () => {
    const { result } = setup('/?q=squat&goals=strength,hypertrophy&days=4&bad=abc')
    expect(result.current.getString('q')).toBe('squat')
    expect(result.current.getList('goals')).toEqual(['strength', 'hypertrophy'])
    expect(result.current.getNumber('days')).toBe(4)
    expect(result.current.getNumber('bad')).toBeNull()
    expect(result.current.getNullable('missing')).toBeNull()
    expect(result.current.getList('missing')).toEqual([])
  })

  it('merges changes and drops empty values', () => {
    const { result } = setup('/?q=squat&page=3')
    act(() => result.current.update({ goals: ['strength', 'endurance'], page: null }))
    expect(result.current.location.search).toBe('?q=squat&goals=strength%2Cendurance')
    act(() => result.current.update({ q: '', goals: [] }))
    expect(result.current.location.search).toBe('')
  })
})
