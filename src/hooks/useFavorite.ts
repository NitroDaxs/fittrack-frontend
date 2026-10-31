import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { favoriteService } from '../services/me'
import { useSaved } from './useMe'

/**
 * Save/unsave state for a routine or exercise. Toggling flips immediately and
 * reverts if the request fails.
 */
export function useFavorite(type: 'routine' | 'exercise', id: number | undefined) {
  const { isMember } = useAuth()
  const queryClient = useQueryClient()
  const { data: saved } = useSaved(isMember)
  const [override, setOverride] = useState<boolean | null>(null) // null until the user toggles

  const list = type === 'routine' ? saved?.routines : saved?.exercises
  const isSaved = override ?? Boolean(list?.some((item) => item.id === id))

  const mutation = useMutation({
    mutationFn: ({ itemId, next }: { itemId: number; next: boolean }) => {
      if (type === 'routine') return next ? favoriteService.saveRoutine(itemId) : favoriteService.unsaveRoutine(itemId)
      return next ? favoriteService.saveExercise(itemId) : favoriteService.unsaveExercise(itemId)
    },
    onMutate: ({ next }) => setOverride(next),
    onError: (_error, { next }) => setOverride(!next),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me', 'saved'] }),
  })

  const toggle = () => {
    if (!isMember || mutation.isPending || id === undefined) return
    mutation.mutate({ itemId: id, next: !isSaved })
  }

  return { isSaved, toggle, pending: mutation.isPending, canSave: isMember }
}
