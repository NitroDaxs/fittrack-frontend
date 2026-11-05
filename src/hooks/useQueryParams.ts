import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export type QueryParamValue = string | number | string[] | null | undefined

/**
 * Reads and writes listing filters in the URL, so a filtered view survives a
 * reload and can be shared. Lists are stored comma-separated (`?goals=a,b`);
 * empty values are dropped so a clean listing has a clean URL.
 */
export function useQueryParams() {
  const [params, setParams] = useSearchParams()

  const getString = useCallback((key: string) => params.get(key) ?? '', [params])

  const getNullable = useCallback((key: string) => params.get(key) || null, [params])

  const getList = useCallback((key: string) => params.get(key)?.split(',').filter(Boolean) ?? [], [params])

  const getNumber = useCallback(
    (key: string) => {
      const value = Number(params.get(key))
      return params.has(key) && Number.isFinite(value) ? value : null
    },
    [params],
  )

  /** Merges `changes` into the current params; null/empty values remove the key. */
  const update = useCallback(
    (changes: Record<string, QueryParamValue>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(changes)) {
            const serialized = Array.isArray(value) ? value.join(',') : value == null ? '' : String(value)
            if (serialized === '') next.delete(key)
            else next.set(key, serialized)
          }
          return next
        },
        // Filtering refines the current view rather than navigating, so it
        // should not stack a history entry per keystroke or checkbox.
        { replace: true },
      )
    },
    [setParams],
  )

  return { getString, getNullable, getList, getNumber, update }
}
