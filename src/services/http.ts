import axios, { type AxiosRequestConfig } from 'axios'
import i18n from '../i18n'

const TOKEN_KEY = 'token'

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY)

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

/** A failed API call. `fieldErrors` holds the first message per field of a 422 response. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number | undefined,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError<ErrorBody>(error)) {
    return new ApiError(error instanceof Error ? error.message : i18n.t('errors.requestFailed'), undefined)
  }
  if (!error.response) {
    return new ApiError(i18n.t('errors.unreachable'), undefined)
  }

  const { status, data } = error.response
  const fieldErrors = Object.fromEntries(
    Object.entries(data?.errors ?? {}).map(([field, messages]) => [field, messages[0] ?? i18n.t('errors.invalidValue')]),
  )
  return new ApiError(data?.message || i18n.t('errors.requestFailed'), status, fieldErrors)
}

/** The message to show for anything a request can throw. */
export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : i18n.t('errors.generic')

export const fieldErrorsOf = (error: unknown): Record<string, string> =>
  error instanceof ApiError ? error.fieldErrors : {}

let onUnauthorized: () => void = () => {}

/** AuthProvider registers here so an expired token ends the session everywhere at once. */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/** The full address of a file the API serves, given its path such as /uploads/x.png. */
export const assetUrl = (path: string): string => new URL(path, new URL(API_URL, window.location.origin)).href

const client = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isCancel(error)) throw error
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.headers.Authorization) {
    setToken(null)
    onUnauthorized()
  }
  throw toApiError(error)
})

type Query = Record<string, unknown>

/** Drops empty filters so they stay out of the URL. */
const cleanQuery = (query: Query): Query =>
  Object.fromEntries(Object.entries(query).filter(([, value]) => value !== null && value !== undefined && value !== ''))

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await client.request<T>(config)
  return response.data
}

export const get = <T>(url: string, query: Query = {}, signal?: AbortSignal) =>
  request<T>({ method: 'GET', url, params: cleanQuery(query), signal })
export const post = <T>(url: string, data?: unknown) => request<T>({ method: 'POST', url, data })
export const put = <T>(url: string, data?: unknown) => request<T>({ method: 'PUT', url, data })
export const patch = <T>(url: string, data?: unknown) => request<T>({ method: 'PATCH', url, data })
export const del = <T>(url: string) => request<T>({ method: 'DELETE', url })
