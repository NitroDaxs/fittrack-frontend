import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { meService, toProfile } from '../services/me'
import type { WorkoutQuery } from '../types/me'

// Everything personal sits under 'me', so a write can refresh it all at once.
const PROFILE_KEY = ['me', 'profile']

export const useProfile = (enabled = true) =>
  useQuery({ queryKey: PROFILE_KEY, queryFn: meService.profile, enabled })

export const useSaved = (enabled = true) =>
  useQuery({ queryKey: ['me', 'saved'], queryFn: meService.saved, enabled })

export const useDashboard = () => useQuery({ queryKey: ['me', 'dashboard'], queryFn: meService.dashboard })

export const useMeasurements = () => useQuery({ queryKey: ['me', 'measurements'], queryFn: meService.measurements })

export const useWorkouts = (query: WorkoutQuery) =>
  useQuery({
    queryKey: ['me', 'workouts', 'list', query],
    queryFn: ({ signal }) => meService.workouts(query, signal),
    placeholderData: keepPreviousData,
  })

export const useWorkout = (id: number | null) =>
  useQuery({
    queryKey: ['me', 'workouts', 'detail', id],
    queryFn: () => meService.workout(id as number),
    enabled: id !== null,
  })

export function useLogWorkout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.logWorkout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useLogMeasurement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.logMeasurement,
    // The dashboard's latest weight and trend come from the same data.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.updateProfile,
    onSuccess: (user) => queryClient.setQueryData(PROFILE_KEY, toProfile(user)),
  })
}
