import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounced } from './useDebounced'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useDebounced', () => {
  it('starts with the initial value', () => {
    const { result } = renderHook(() => useDebounced('a'))
    expect(result.current).toBe('a')
  })

  it('updates only after the value has been stable for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounced(value, 250), { initialProps: { value: 'a' } })
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(249))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('ab')
  })

  it('restarts the timer on every change, so only the last value lands', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounced(value, 100), { initialProps: { value: 'a' } })
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(80))
    rerender({ value: 'abc' })
    act(() => vi.advanceTimersByTime(80))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(20))
    expect(result.current).toBe('abc')
  })
})
