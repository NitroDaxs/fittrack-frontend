import { endpoints } from './endpoints'
import { del, get, post, put } from './http'
import type { UserDto } from '../types/auth'
import { toExercise } from './exercises'
import type { BodyMeasurementDto, ConsistencyDay, Dashboard, DashboardDto, DayCountDto, FavoritesDto, LogMeasurementRequest, LogWorkoutRequest, Measurement, MeasurementForm, Profile, ProgressionDto, Saved, UpdateProfileRequest, Workout, WorkoutEntry, WorkoutLogDto, WorkoutLogForm, WorkoutQuery } from '../types/me'
import { toRoutine } from './routines'
import { toPage } from './shared'
import type { MessageResponse, PagedDto } from '../types/shared'

export function toProfile(raw: UserDto): Profile {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    units: raw.units,
    plan: raw.role === 'admin' ? 'Admin' : 'Member',
    joined: new Date(raw.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
  }
}

export function toWorkout(raw: WorkoutLogDto): Workout {
  // The API sends one row per set; the UI groups them by exercise, keeping the
  // order each exercise first appears in.
  const byExercise = new Map<number, WorkoutEntry>()
  for (const set of raw.set_logs) {
    let entry = byExercise.get(set.exercise_id)
    if (!entry) {
      entry = { exerciseId: set.exercise_id, exercise: toExercise(set.exercise), sets: [] }
      byExercise.set(set.exercise_id, entry)
    }
    entry.sets.push({ weight: set.weight, reps: set.reps })
  }

  return {
    id: raw.id,
    name: raw.name,
    performedAt: raw.date,
    minutes: raw.duration_minutes,
    entries: [...byExercise.values()],
  }
}

export function toWorkoutRequest(form: WorkoutLogForm): LogWorkoutRequest {
  return {
    name: form.name,
    duration_minutes: form.minutes,
    // An exercise the user skipped has no sets, and the API rejects an empty list.
    exercises: form.entries
      .filter((entry) => entry.sets.length > 0)
      .map((entry) => ({ exercise_id: entry.exerciseId, sets: entry.sets })),
  }
}

export function toMeasurement(raw: BodyMeasurementDto): Measurement {
  const custom = raw.custom_measurements
  return {
    id: raw.id,
    date: raw.date,
    weight: raw.weight,
    bodyFat: raw.body_fat_pct,
    waist: custom?.waist ?? null,
    chest: custom?.chest ?? null,
    arms: custom?.arms ?? null,
  }
}

export function toMeasurementRequest(form: MeasurementForm): LogMeasurementRequest {
  return {
    weight: form.weight,
    body_fat_pct: form.bodyFat,
    custom_measurements: { waist: form.waist, chest: form.chest, arms: form.arms },
  }
}

export const toSaved = (raw: FavoritesDto): Saved => ({
  routines: raw.routines.map(toRoutine),
  exercises: raw.exercises.map(toExercise),
})

const CONSISTENCY_DAYS = 90

const isoDay = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** The API only lists days that had a workout, but the heatmap needs every day to line its weeks up. */
function fillConsistency(days: DayCountDto[], today = new Date()): ConsistencyDay[] {
  const counts = new Map(days.map((day) => [day.date, day.count]))
  return Array.from({ length: CONSISTENCY_DAYS + 1 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - CONSISTENCY_DAYS + index)
    const key = isoDay(date)
    return { date: key, count: counts.get(key) ?? 0 }
  })
}

function toStrength(progression: ProgressionDto | null): Dashboard['strength'] {
  if (!progression) return null
  return {
    lift: progression.exercise.name,
    series: progression.data.map((point) => ({
      label: new Date(`${point.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: point.max_weight,
    })),
  }
}

export const toDashboard = (raw: DashboardDto): Dashboard => ({
  stats: {
    streak: raw.stats.current_streak,
    workoutsThisWeek: raw.stats.workouts_this_week,
    latestWeight: raw.stats.latest_body_weight,
  },
  consistency: fillConsistency(raw.consistency),
  weightSeries: raw.measurement_trend.map((point) => ({
    date: point.date,
    weight: point.weight,
    bodyFat: point.body_fat_pct,
  })),
  strength: toStrength(raw.default_progression),
})

export const meService = {
  profile: () => get<UserDto>(endpoints.me.profile).then(toProfile),
  updateProfile: (body: UpdateProfileRequest) => put<UserDto>(endpoints.me.profile, body),
  saved: () => get<FavoritesDto>(endpoints.me.saved).then(toSaved),
  dashboard: () => get<DashboardDto>(endpoints.me.dashboard).then(toDashboard),
  workouts: (query: WorkoutQuery, signal?: AbortSignal) =>
    get<PagedDto<WorkoutLogDto>>(endpoints.me.workouts, { ...query }, signal).then((res) => toPage(res, toWorkout)),
  workout: (id: number) => get<WorkoutLogDto>(endpoints.me.workout(id)).then(toWorkout),
  logWorkout: (form: WorkoutLogForm) => post<WorkoutLogDto>(endpoints.me.workouts, toWorkoutRequest(form)),
  measurements: () => get<BodyMeasurementDto[]>(endpoints.me.measurements).then((rows) => rows.map(toMeasurement)),
  logMeasurement: (form: MeasurementForm) =>
    post<BodyMeasurementDto>(endpoints.me.measurements, toMeasurementRequest(form)).then(toMeasurement),
}

export const favoriteService = {
  saveRoutine: (id: number) => post<MessageResponse>(endpoints.routines.save(id)),
  unsaveRoutine: (id: number) => del<MessageResponse>(endpoints.routines.save(id)),
  saveExercise: (id: number) => post<MessageResponse>(endpoints.exercises.save(id)),
  unsaveExercise: (id: number) => del<MessageResponse>(endpoints.exercises.save(id)),
}
