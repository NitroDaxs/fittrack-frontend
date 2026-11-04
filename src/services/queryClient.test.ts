import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../i18n'
import { ApiError } from './http'
import { queryClient } from './queryClient'

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const retry = queryClient.getDefaultOptions().queries!.retry as (count: number, error: Error) => boolean

beforeEach(() => vi.mocked(toast.error).mockClear())

describe('query retry policy', () => {
  it('retries network and server errors up to twice', () => {
    expect(retry(0, new ApiError('down', undefined))).toBe(true)
    expect(retry(1, new ApiError('oops', 503))).toBe(true)
    expect(retry(2, new ApiError('oops', 503))).toBe(false)
    expect(retry(0, new Error('unknown'))).toBe(true)
  })

  it('never retries client errors', () => {
    expect(retry(0, new ApiError('nope', 404))).toBe(false)
    expect(retry(0, new ApiError('nope', 422))).toBe(false)
  })

  it('keeps data fresh for 30s and does not refetch on focus', () => {
    expect(queryClient.getDefaultOptions().queries).toMatchObject({ staleTime: 30_000, refetchOnWindowFocus: false })
  })
})

describe('mutation errors', () => {
  const runFailingMutation = (error: Error) =>
    queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.reject(error) })
      .execute(undefined)
      .catch(() => {})

  it('show the server message as a toast', async () => {
    await runFailingMutation(new ApiError('Email taken', 422))
    expect(toast.error).toHaveBeenCalledWith('Email taken')
  })

  it('stay quiet for 401s, which end the session with their own message', async () => {
    await runFailingMutation(new ApiError('Unauthenticated', 401))
    expect(toast.error).not.toHaveBeenCalled()
  })
})

describe('language changes', () => {
  it('invalidate every cached query', async () => {
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    await i18n.changeLanguage('bg')
    await i18n.changeLanguage('en')
    expect(spy).toHaveBeenCalled()
  })
})
