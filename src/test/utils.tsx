import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, type RenderOptions } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

/** A fresh client per test: no retries, no shared cache. */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })

interface WrapperOptions {
  queryClient?: QueryClient
  route?: string | { pathname: string; state?: unknown }
}

export function createWrapper({ queryClient = createTestQueryClient(), route = '/' }: WrapperOptions = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  return { Wrapper, queryClient }
}

export function renderWithProviders(ui: ReactNode, options: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {}) {
  const { queryClient, route, ...rest } = options
  const { Wrapper, queryClient: client } = createWrapper({ queryClient, route })
  return { ...render(ui, { wrapper: Wrapper, ...rest }), queryClient: client }
}

/**
 * Runs `fn`, expected to render something that throws, without React and jsdom
 * printing the (expected) error and its stack.
 */
export function silenceRenderErrors<T>(fn: () => T): T {
  const swallow = (event: ErrorEvent) => event.preventDefault()
  window.addEventListener('error', swallow)
  const original = console.error
  console.error = () => {}
  try {
    return fn()
  } finally {
    console.error = original
    window.removeEventListener('error', swallow)
  }
}

export function renderHookWithProviders<T>(hook: () => T, options: WrapperOptions = {}) {
  const { Wrapper, queryClient } = createWrapper(options)
  return { ...renderHook(hook, { wrapper: Wrapper }), queryClient }
}
