import { useQuery } from '@tanstack/react-query'
import { adminService } from '../services/admin'

export const useAdminStats = () => useQuery({ queryKey: ['admin', 'stats'], queryFn: adminService.stats })

export const useAdminActivity = () => useQuery({ queryKey: ['admin', 'activity'], queryFn: adminService.activity })

/** Searches every exercise, including unpublished ones, once there's enough to search on. */
export const useAdminExercisePicker = (search: string) =>
  useQuery({
    queryKey: ['admin', 'exercises', 'picker', search],
    queryFn: ({ signal }) => adminService.exercises.list({ search, perPage: 6 }, signal),
    enabled: search.trim().length >= 2,
  })
