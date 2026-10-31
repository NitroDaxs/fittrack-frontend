import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '../i18n'
import { setToken } from '../services/http'
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
    onSuccess: () => {
      toast.success(i18n.t('toast.workoutSaved'))
      return queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useLogMeasurement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.logMeasurement,
    // The dashboard's latest weight and trend come from the same data.
    onSuccess: () => {
      toast.success(i18n.t('toast.measurementSaved'))
      return queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.uploadAvatar,
    onSuccess: (user) => queryClient.setQueryData(PROFILE_KEY, toProfile(user)),
  })
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.removeAvatar,
    onSuccess: (user) => queryClient.setQueryData(PROFILE_KEY, toProfile(user)),
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.changePassword,
    onSuccess: ({ user, access_token }) => {
      // The old token stopped working when the password changed.
      setToken(access_token)
      queryClient.setQueryData(PROFILE_KEY, toProfile(user))
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: meService.updateProfile,
    onSuccess: (user) => queryClient.setQueryData(PROFILE_KEY, toProfile(user)),
  })
}
