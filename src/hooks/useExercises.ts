import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { exerciseService } from '../services/exercises'
import type { ExerciseQuery } from '../types/exercises'

export const useExercises = (query: ExerciseQuery, enabled = true) =>
  useQuery({
    queryKey: ['exercises', 'list', query],
    queryFn: ({ signal }) => exerciseService.list(query, signal),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useExercise = (key: string) =>
  useQuery({ queryKey: ['exercises', 'detail', key], queryFn: () => exerciseService.show(key) })
