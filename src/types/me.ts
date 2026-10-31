import type { UserDto } from './auth'
import type { Exercise, ExerciseDto } from './exercises'
import type { CreatorDto, Routine, RoutineDto } from './routines'
import type { PageQuery, Units } from './shared'

export interface FavoritesDto {
  routines: RoutineDto[]
  exercises: ExerciseDto[]
}

export interface SetLogDto {
  id: number
  exercise_id: number
  set_number: number
  weight: number
  reps: number
  is_completed: boolean
  exercise: ExerciseDto
}

export interface WorkoutLogDto {
  id: number
  user_id: number
  workout_id: number | null
  name: string
  date: string
  duration_minutes: number | null
  notes: string | null
  created_at: string
  set_logs: SetLogDto[]
}

export interface CustomMeasurementsDto {
  waist?: number | null
  chest?: number | null
  arms?: number | null
  shoulders?: number | null
  hips?: number | null
  thighs?: number | null
  calves?: number | null
}

export interface BodyMeasurementDto {
  id: number
  date: string
  weight: number | null
  body_fat_pct: number | null
  custom_measurements: CustomMeasurementsDto | null
  photo_url: string | null
  created_at: string
}

export interface DayCountDto {
  date: string
  count: number
}

export interface TrendPointDto {
  date: string
  weight: number | null
  body_fat_pct: number | null
}

export interface ProgressionDto {
  exercise: CreatorDto
  data: { date: string; max_weight: number; estimated_1rm: number }[]
}

export interface DashboardDto {
  user: { id: number; name: string }
  stats: {
    current_streak: number
    workouts_this_week: number
    latest_body_weight: number | null
  }
  consistency: DayCountDto[]
  measurement_trend: TrendPointDto[]
  default_progression: ProgressionDto | null
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  units?: Units
  /** Required when changing the email. */
  current_password?: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface LogWorkoutRequest {
  name: string
  duration_minutes: number
  exercises: {
    exercise_id: number
    sets: { weight: number; reps: number }[]
  }[]
}

export interface LogMeasurementRequest {
  weight: number | null
  body_fat_pct: number | null
  custom_measurements: CustomMeasurementsDto
}

export interface Profile {
  id: number
  name: string
  email: string
  role: UserDto['role']
  units: UserDto['units']
  plan: string
  joined: string
  avatarUrl: string | null
}

export interface LoggedSet {
  weight: number
  reps: number
}

export interface WorkoutEntry {
  exerciseId: number
  exercise: Exercise
  sets: LoggedSet[]
}

export interface Workout {
  id: number
  name: string
  performedAt: string
  minutes: number | null
  entries: WorkoutEntry[]
}

export interface Measurement {
  id: number
  date: string
  weight: number | null
  bodyFat: number | null
  waist: number | null
  chest: number | null
  arms: number | null
}

export interface StrengthPoint {
  label: string
  value: number
}

export interface WeightPoint {
  date: string
  weight: number | null
  bodyFat: number | null
}

export interface ConsistencyDay {
  date: string
  count: number
}

export interface Dashboard {
  stats: {
    streak: number
    workoutsThisWeek: number
    latestWeight: number | null
  }
  /** One entry for every day in the window, including days with no workout. */
  consistency: ConsistencyDay[]
  weightSeries: WeightPoint[]
  strength: { lift: string; series: StrengthPoint[] } | null
}

export interface Saved {
  routines: Routine[]
  exercises: Exercise[]
}

export interface MeasurementForm {
  weight: number | null
  bodyFat: number | null
  waist: number | null
  chest: number | null
  arms: number | null
}

export interface WorkoutLogForm {
  name: string
  minutes: number
  entries: { exerciseId: number; sets: LoggedSet[] }[]
}

export interface WorkoutQuery extends PageQuery {
  search?: string
  range?: string
}
