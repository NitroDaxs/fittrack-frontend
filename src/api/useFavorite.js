import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useResource } from './hooks'
import { favoritesApi, meApi } from './resources'

/**
 * Save/unsave state for a routine or exercise. Initial state is derived from
 * `/me/saved` (only fetched for signed-in members); toggling posts to the
 * backend and optimistically flips, reverting if the request fails.
 *
 * `type` is 'routine' or 'exercise', `id` the numeric record id.
 */
export function useFavorite(type, id) {
  const { isMember } = useAuth()
  const { data: saved } = useResource(() => meApi.saved(), [], { skip: !isMember })
  const [override, setOverride] = useState(null) // null until the user toggles
  const [pending, setPending] = useState(false)

  const list = type === 'routine' ? saved?.routines : saved?.exercises
  const serverSaved = Boolean(list?.some((item) => item.id === id))
  const isSaved = override ?? serverSaved

  const toggle = async () => {
    if (!isMember || pending || id == null) return
    const next = !isSaved
    setOverride(next)
    setPending(true)
    try {
      if (type === 'routine') {
        if (next) await favoritesApi.saveRoutine(id)
        else await favoritesApi.unsaveRoutine(id)
      } else {
        if (next) await favoritesApi.saveExercise(id)
        else await favoritesApi.unsaveExercise(id)
      }
    } catch {
      setOverride(!next) // revert on failure
    } finally {
      setPending(false)
    }
  }

  return { isSaved, toggle, pending, canSave: isMember }
}
