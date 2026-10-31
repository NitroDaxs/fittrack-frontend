import type { DifficultyValue, PageQuery } from './shared'

export type ExerciseCategoryValue =
  | 'strength'
  | 'cardio'
  | 'stretching'
  | 'plyometrics'
  | 'powerlifting'
  | 'olympic_weightlifting'
  | 'strongman'

export interface TaxonomyDto {
  id: number
  name: string
  slug: string
}

export interface MuscleGroupDto extends TaxonomyDto {
  pivot: { role: 'primary' | 'secondary' }
}

export interface MediaDto {
  id: number
  type: 'image' | 'video'
  url: string
  sort_order: number
}

export interface ExerciseDto {
  id: number
  name: string
  slug: string
  description: string | null
  instructions: string | null
  difficulty: DifficultyValue
  exercise_type: ExerciseCategoryValue
  video_url: string | null
  thumbnail_url: string | null
  created_by: number
  is_published: boolean
  created_at: string
  updated_at: string
  muscle_groups: MuscleGroupDto[]
  equipment: TaxonomyDto[]
  media: MediaDto[]
}

export interface ExerciseRequest {
  name: string
  description: string
  instructions: string
  difficulty: DifficultyValue
  exercise_type: ExerciseCategoryValue
  muscle_groups: string[]
  primary_muscles: string[]
  equipment: string[]
  video_url?: string
  thumbnail_url?: string
}

export interface ExerciseStep {
  title: string
  body: string
}

export interface Exercise {
  id: number
  name: string
  slug: string
  description: string
  instructions: string
  difficulty: string
  category: string
  videoId: string | null
  videoUrl: string
  thumbnailUrl: string
  image: string
  /** Natively 16:9, for square crops where `image`'s letterboxing would show. */
  imageWide: string
  icon: string
  muscleGroups: string[]
  /** Comma-separated names. */
  primaryMuscles: string
  /** Comma-separated names. */
  equipment: string
  steps: ExerciseStep[]
}

export interface ExerciseForm {
  name: string
  description: string
  instructions: string
  muscleGroups: string[]
  equipmentList: string[]
  difficulty: string
  category: string
  primaryMuscles: string
  videoUrl: string
  thumbnailUrl: string
}

// One function per endpoint. Components call these and never see the wire format.
export interface ExerciseQuery extends PageQuery {
  search?: string
  muscleGroup?: string | null
  equipment?: string | null
  difficulty?: string | null
}
