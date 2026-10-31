import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { routineService } from '../services/routines'
import type { RoutineQuery } from '../types/routines'

export const useRoutines = (query: RoutineQuery) =>
  useQuery({
    queryKey: ['routines', 'list', query],
    queryFn: ({ signal }) => routineService.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const useRoutine = (key: string) =>
  useQuery({ queryKey: ['routines', 'detail', key], queryFn: () => routineService.show(key) })
