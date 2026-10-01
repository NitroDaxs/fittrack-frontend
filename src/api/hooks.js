// Minimal data-fetching hooks. Deliberately small -- if this project later adopts
// TanStack Query, useResource is the only thing that has to be replaced.

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs `fetcher` whenever `deps` change and tracks loading/error state.
 * Stale responses are discarded, so fast filter typing can not reorder results.
 */
export function useResource(fetcher, deps = [], { skip = false, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!skip)
  const [error, setError] = useState(null)
  const [nonce, setNonce] = useState(0)
  const requestId = useRef(0)

  const refetch = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (skip) {
      setLoading(false)
      return undefined
    }
    const id = ++requestId.current
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.resolve()
      .then(fetcher)
      .then((result) => {
        if (cancelled || id !== requestId.current) return
        setData(result)
      })
      .catch((err) => {
        if (cancelled || id !== requestId.current) return
        setError(err)
      })
      .finally(() => {
        if (cancelled || id !== requestId.current) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce, skip])

  return { data, loading, error, refetch, setData }
}

/** Wraps a write call with pending/error state for modal submit buttons. */
export function useMutation(mutator) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(
    async (...args) => {
      setPending(true)
      setError(null)
      try {
        return await mutator(...args)
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setPending(false)
      }
    },
    [mutator]
  )

  return { mutate, pending, error }
}

/** Delays a fast-changing value (search inputs) so we do not fire a request per keystroke. */
export function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
