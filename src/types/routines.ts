import type { IconName } from '../components/ui/Icon'
import type { Exercise, ExerciseDto } from './exercises'
import type { DifficultyValue, PageQuery } from './shared'

export type RoutineGoalValue = 'strength' | 'hypertrophy' | 'fat_loss' | 'endurance' | 'general_fitness'

export interface CreatorDto {
  id: number
  name: string
}

export interface WorkoutExerciseDto {
  id: number
  exercise_id: number
  order: number
  target_sets: number | null
  target_reps: string | null
  target_weight: number | null
  rest_seconds: number | null
  notes: string | null
  exercise: ExerciseDto
}

export interface WorkoutDto {
  id: number
  name: string
  day_order: number | null
  workout_exercises: WorkoutExerciseDto[]
}

export interface RoutineDto {
  id: number
  title: string
  slug: string
  description: string | null
  goal: RoutineGoalValue
  level: DifficultyValue
  days_per_week: number
  is_public: boolean
  is_published: boolean
  created_at: string
  creator: CreatorDto | null
  image_url: string | null
  /** Only on detail responses. */
  workouts?: WorkoutDto[]
}

export interface RoutineDayExerciseRequest {
  exercise_id: number
  target_sets: number | null
  target_reps: string | null
  target_weight: number | null
  rest_seconds: number | null
  notes: string | null
}

export interface RoutineRequest {
  title: string
  description: string
  goal: RoutineGoalValue
  level: DifficultyValue
  days_per_week: number
  is_public: boolean
  /** An empty string removes the image. */
  image_url: string
  /** Left out when unchanged: the API treats a missing key as "keep the schedule". */
  days?: { name: string; exercises: RoutineDayExerciseRequest[] }[]
}

export interface RoutineDayEntry {
  exerciseId: number
  exercise: Exercise
  note: string | null
  sets: number | null
  reps: string | null
}

export interface RoutineDay {
  id: number
  name: string
  focus: string
  exercises: RoutineDayEntry[]
}

export interface Routine {
  id: number
  title: string
  slug: string
  description: string
  goal: string
  level: string
  daysPerWeek: number
  isPublic: boolean
  icon: IconName
  image: string
  days: RoutineDay[]
}

/** One exercise in the admin programme editor. */
export interface ProgrammeExercise {
  exercise_id: number
  name: string
  target_sets: number | null
  target_reps: string
  target_weight?: number | null
  rest_seconds: number | null
  notes: string
}

export interface ProgrammeDay {
  name: string
  exercises: ProgrammeExercise[]
}

export interface RoutineForm {
  title: string
  description: string
  goal: string
  level: string
  daysPerWeek: number | string
  isPublic: boolean
  imageUrl: string
  days: ProgrammeDay[]
}

export interface RoutineQuery extends PageQuery {
  search?: string
  goals?: string[]
  levels?: string[]
  daysPerWeek?: number | null
}
