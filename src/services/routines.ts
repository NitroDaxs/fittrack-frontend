import { endpoints } from './endpoints'
import { get } from './http'
import { toExercise } from './exercises'
import type { ProgrammeDay, Routine, RoutineDay, RoutineDto, RoutineForm, RoutineGoalValue, RoutineQuery, RoutineRequest, WorkoutDto } from '../types/routines'
import { titleCase, toPage, toSlug, toSnake } from './shared'
import type { DifficultyValue, PagedDto } from '../types/shared'

function toRoutineDay(workout: WorkoutDto): RoutineDay {
  return {
    id: workout.id,
    name: `Day ${workout.day_order}`,
    focus: workout.name,
    exercises: [...workout.workout_exercises]
      .sort((a, b) => a.order - b.order)
      .map((entry) => ({
        exerciseId: entry.exercise_id,
        exercise: toExercise(entry.exercise),
        note: entry.notes,
        sets: entry.target_sets,
        reps: entry.target_reps,
      })),
  }
}

export function toRoutine(raw: RoutineDto): Routine {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    description: raw.description ?? '',
    goal: titleCase(raw.goal),
    level: titleCase(raw.level),
    daysPerWeek: raw.days_per_week,
    isPublic: raw.is_public,
    icon: 'calendar-days',
    days: (raw.workouts ?? []).map(toRoutineDay),
  }
}

/** The programme in the shape RoutineDayBuilder edits. */
export function toProgramme(raw: RoutineDto): ProgrammeDay[] {
  return (raw.workouts ?? []).map((workout) => ({
    name: workout.name,
    exercises: workout.workout_exercises.map((entry) => ({
      exercise_id: entry.exercise_id,
      name: entry.exercise.name,
      target_sets: entry.target_sets,
      target_reps: entry.target_reps ?? '',
      target_weight: entry.target_weight,
      rest_seconds: entry.rest_seconds,
      notes: entry.notes ?? '',
    })),
  }))
}

export function toRoutineRequest(form: RoutineForm): RoutineRequest {
  return {
    title: form.title,
    description: form.description,
    goal: toSnake(form.goal) as RoutineGoalValue,
    level: toSlug(form.level) as DifficultyValue,
    days_per_week: Number(form.daysPerWeek),
    is_public: form.isPublic,
    // A metadata-only edit must not wipe an existing programme.
    ...(form.days.length > 0
      ? {
          days: form.days.map((day) => ({
            name: day.name,
            exercises: day.exercises.map((entry) => ({
              exercise_id: entry.exercise_id,
              target_sets: entry.target_sets,
              target_reps: entry.target_reps || null,
              target_weight: entry.target_weight ?? null,
              rest_seconds: entry.rest_seconds,
              notes: entry.notes || null,
            })),
          })),
        }
      : {}),
  }
}

export const routineService = {
  list: (query: RoutineQuery, signal?: AbortSignal) =>
    get<PagedDto<RoutineDto>>(endpoints.routines.list, { ...query }, signal).then((res) => toPage(res, toRoutine)),
  show: (key: string) => get<RoutineDto>(endpoints.routines.show(key)).then(toRoutine),
}
