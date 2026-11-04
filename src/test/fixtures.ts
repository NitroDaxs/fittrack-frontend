import type { ArticleDto } from '../types/articles'
import type { UserDto } from '../types/auth'
import type { Exercise, ExerciseDto } from '../types/exercises'
import type { WorkoutLogDto } from '../types/me'
import type { RoutineDto, WorkoutDto, WorkoutExerciseDto } from '../types/routines'
import type { PagedDto } from '../types/shared'

/** API-shaped records with sensible defaults; override only what a test cares about. */

export const userDto = (overrides: Partial<UserDto> = {}): UserDto => ({
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'member',
  units: 'imperial',
  is_active: true,
  created_at: '2024-03-15T10:00:00Z',
  avatar_url: null,
  ...overrides,
})

export const exerciseDto = (overrides: Partial<ExerciseDto> = {}): ExerciseDto => ({
  id: 10,
  name: 'Bench Press',
  slug: 'bench-press',
  description: 'Press the bar.',
  instructions: '1. Lie down\n2. Press up',
  difficulty: 'intermediate',
  exercise_type: 'strength',
  video_url: null,
  thumbnail_url: 'https://img.example.com/bench.jpg',
  created_by: 1,
  is_published: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  muscle_groups: [
    { id: 1, name: 'Chest', slug: 'chest', pivot: { role: 'primary' } },
    { id: 2, name: 'Triceps', slug: 'triceps', pivot: { role: 'secondary' } },
  ],
  equipment: [
    { id: 1, name: 'Barbell', slug: 'barbell' },
    { id: 2, name: 'Bench', slug: 'bench' },
  ],
  media: [],
  ...overrides,
})

export const workoutExerciseDto = (overrides: Partial<WorkoutExerciseDto> = {}): WorkoutExerciseDto => ({
  id: 100,
  exercise_id: 10,
  order: 1,
  target_sets: 3,
  target_reps: '8-12',
  target_weight: null,
  rest_seconds: 90,
  notes: null,
  exercise: exerciseDto(),
  ...overrides,
})

export const workoutDto = (overrides: Partial<WorkoutDto> = {}): WorkoutDto => ({
  id: 50,
  name: 'Push',
  day_order: 1,
  workout_exercises: [workoutExerciseDto()],
  ...overrides,
})

export const routineDto = (overrides: Partial<RoutineDto> = {}): RoutineDto => ({
  id: 5,
  title: 'Push Pull Legs',
  slug: 'push-pull-legs',
  description: 'Classic split.',
  goal: 'general_fitness',
  level: 'beginner',
  days_per_week: 3,
  is_public: true,
  is_published: true,
  created_at: '2024-01-01T00:00:00Z',
  creator: null,
  image_url: null,
  ...overrides,
})

export const articleDto = (overrides: Partial<ArticleDto> = {}): ArticleDto => ({
  id: 7,
  slug: 'protein-101',
  title: 'Protein 101',
  category: 'training_theory',
  status: 'published',
  excerpt: 'Eat it.',
  author: 'Coach',
  date: '2024-02-02',
  readMinutes: 4,
  image: 'https://img.example.com/protein.jpg',
  ...overrides,
})

export const workoutLogDto = (overrides: Partial<WorkoutLogDto> = {}): WorkoutLogDto => ({
  id: 3,
  user_id: 1,
  workout_id: null,
  name: 'Monday',
  date: '2024-05-06',
  duration_minutes: 45,
  notes: null,
  created_at: '2024-05-06T18:00:00Z',
  set_logs: [],
  ...overrides,
})

export const paged = <T>(data: T[], overrides: Partial<PagedDto<T>> = {}): PagedDto<T> => ({
  data,
  current_page: 1,
  per_page: 15,
  total: data.length,
  last_page: 1,
  from: data.length ? 1 : null,
  to: data.length || null,
  ...overrides,
})

/** A UI-shaped exercise, for code that consumes mapped data (contexts, components). */
export const exercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id: 10,
  name: 'Bench Press',
  slug: 'bench-press',
  description: '',
  instructions: '',
  difficulty: 'Intermediate',
  category: 'Strength',
  videoId: null,
  videoUrl: '',
  thumbnailUrl: '',
  image: 'bench.jpg',
  imageWide: 'bench-wide.jpg',
  icon: 'dumbbell',
  muscleGroups: ['Chest', 'Triceps'],
  primaryMuscles: 'Chest',
  equipment: 'Barbell, Bench',
  steps: [],
  ...overrides,
})
