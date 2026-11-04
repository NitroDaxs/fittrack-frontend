import { AxiosError, AxiosHeaders, CanceledError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'

// Every request made by the client goes through this fake adapter instead of the network.
const adapter = vi.hoisted(() => vi.fn())

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  const axios = actual.default
  const wrapped = Object.assign(Object.create(Object.getPrototypeOf(axios)), axios, {
    create: (config: Parameters<typeof axios.create>[0]) => axios.create({ ...config, adapter }),
  })
  return { ...actual, default: wrapped }
})

const { ApiError, assetUrl, del, errorMessage, fieldErrorsOf, get, getToken, patch, post, put, setToken, setUnauthorizedHandler } =
  await import('./http')

const ok = (data: unknown) => (config: InternalAxiosRequestConfig): Promise<AxiosResponse> =>
  Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config })

const fail = (status: number, data: unknown) => (config: InternalAxiosRequestConfig) =>
  Promise.reject(
    new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, {}, {
      data,
      status,
      statusText: '',
      headers: {},
      config,
    }),
  )

const lastConfig = (): InternalAxiosRequestConfig => adapter.mock.calls.at(-1)![0]

beforeEach(() => {
  adapter.mockReset()
  adapter.mockImplementation(ok({ ok: true }))
})

afterEach(() => {
  setUnauthorizedHandler(() => {})
})

describe('token storage', () => {
  it('stores, reads and clears the token', () => {
    expect(getToken()).toBeNull()
    setToken('abc')
    expect(getToken()).toBe('abc')
    expect(localStorage.getItem('token')).toBe('abc')
    setToken(null)
    expect(getToken()).toBeNull()
  })
})

describe('request helpers', () => {
  it('get returns the response body and sends the query without empty filters', async () => {
    adapter.mockImplementation(ok([1, 2]))
    const signal = new AbortController().signal
    await expect(get('/things', { search: 'x', page: 2, a: '', b: null, c: undefined, zero: 0, no: false }, signal)).resolves.toEqual([1, 2])
    const config = lastConfig()
    expect(config.method).toBe('get')
    expect(config.url).toBe('/things')
    expect(config.params).toEqual({ search: 'x', page: 2, zero: 0, no: false })
    expect(config.signal).toBe(signal)
  })

  it.each([
    ['post', post, 'post'],
    ['put', put, 'put'],
    ['patch', patch, 'patch'],
  ] as const)('%s sends a JSON body', async (_name, fn, method) => {
    await fn('/x', { a: 1 })
    expect(lastConfig().method).toBe(method)
    expect(JSON.parse(lastConfig().data as string)).toEqual({ a: 1 })
  })

  it('del sends a DELETE', async () => {
    await del('/x/1')
    expect(lastConfig()).toMatchObject({ method: 'delete', url: '/x/1' })
  })

  it('uses the API base URL and asks for JSON', async () => {
    await get('/x')
    expect(lastConfig().baseURL).toBe(import.meta.env.VITE_API_URL || 'http://localhost:8000/api')
    expect(AxiosHeaders.from(lastConfig().headers).get('Accept')).toBe('application/json')
  })
})

describe('auth header', () => {
  it('is sent when a token is stored', async () => {
    setToken('secret')
    await get('/x')
    expect(lastConfig().headers.Authorization).toBe('Bearer secret')
  })

  it('is left off without a token', async () => {
    await get('/x')
    expect(lastConfig().headers.Authorization).toBeUndefined()
  })
})

describe('errors', () => {
  it('turns a 422 into an ApiError with the first message per field', async () => {
    adapter.mockImplementation(fail(422, { message: 'Invalid data', errors: { email: ['Taken', 'Other'], name: [] } }))
    const error = await post('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      name: 'ApiError',
      message: 'Invalid data',
      status: 422,
      fieldErrors: { email: 'Taken', name: i18n.t('errors.invalidValue') },
    })
  })

  it('falls back to a generic message when the body has none', async () => {
    adapter.mockImplementation(fail(500, null))
    await expect(get('/x')).rejects.toMatchObject({ message: i18n.t('errors.requestFailed'), status: 500, fieldErrors: {} })
  })

  it('reports an unreachable server', async () => {
    adapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      Promise.reject(new AxiosError('Network Error', 'ERR_NETWORK', config, {})),
    )
    await expect(get('/x')).rejects.toMatchObject({ message: i18n.t('errors.unreachable'), status: undefined })
  })

  it('wraps a non-axios error', async () => {
    adapter.mockImplementation(() => Promise.reject(new Error('boom')))
    await expect(get('/x')).rejects.toMatchObject({ name: 'ApiError', message: 'boom', status: undefined })
  })

  it('rethrows cancellations untouched', async () => {
    adapter.mockImplementation(() => Promise.reject(new CanceledError()))
    const error = await get('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(CanceledError)
    expect(error).not.toBeInstanceOf(ApiError)
  })
})

describe('401 handling', () => {
  it('ends the session when an authenticated request is rejected', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    setToken('expired')
    adapter.mockImplementation(fail(401, { message: 'Unauthenticated.' }))

    await expect(get('/me')).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(getToken()).toBeNull()
  })

  it('does not end a session for an anonymous 401 (e.g. wrong login)', async () => {
    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    adapter.mockImplementation(fail(401, { message: 'Wrong password' }))

    await expect(post('/login')).rejects.toMatchObject({ message: 'Wrong password' })
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})

describe('errorMessage / fieldErrorsOf', () => {
  it('errorMessage uses the error message or a generic fallback', () => {
    expect(errorMessage(new Error('x'))).toBe('x')
    expect(errorMessage('weird')).toBe(i18n.t('errors.generic'))
  })

  it('fieldErrorsOf only reads ApiErrors', () => {
    expect(fieldErrorsOf(new ApiError('m', 422, { a: 'b' }))).toEqual({ a: 'b' })
    expect(fieldErrorsOf(new Error('m'))).toEqual({})
    expect(fieldErrorsOf(null)).toEqual({})
  })
})

describe('assetUrl', () => {
  it('resolves an absolute path against the API origin', () => {
    const origin = new URL(import.meta.env.VITE_API_URL || 'http://localhost:8000/api', window.location.origin).origin
    expect(assetUrl('/uploads/a.png')).toBe(`${origin}/uploads/a.png`)
  })

  it('keeps full URLs as they are', () => {
    expect(assetUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
  })
})
