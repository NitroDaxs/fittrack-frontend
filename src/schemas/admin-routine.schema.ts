import * as z from 'zod'
import i18n from '../i18n'
import type { ProgrammeDay } from '../types/routines'
import { msg, optionalHttpUrl, requiredNumber, requiredText, wholeBetween } from './shared'

export const ROUTINE_TITLE_MAX = 255
export const DAY_NAME_MAX = 255
export const MAX_SETS = 20
export const MAX_REPS_LENGTH = 20
export const MAX_REST_SECONDS = 900

const dayName = (day: ProgrammeDay, index: number) => day.name || i18n.t('common.day', { n: index + 1 })

const exerciseIsValid = (entry: ProgrammeDay['exercises'][number]) =>
  (entry.target_sets == null || (Number.isInteger(entry.target_sets) && entry.target_sets >= 1 && entry.target_sets <= MAX_SETS)) &&
  (entry.target_reps ?? '').length <= MAX_REPS_LENGTH &&
  (entry.rest_seconds == null || (Number.isInteger(entry.rest_seconds) && entry.rest_seconds >= 0 && entry.rest_seconds <= MAX_REST_SECONDS))

/**
 * The day-by-day programme is edited by RoutineDayBuilder, so its problems are
 * reported as one message on `days` naming the day to fix.
 */
const programme = z.custom<ProgrammeDay[]>().superRefine((days, ctx) => {
  days.forEach((day, index) => {
    if (day.name.trim().length > DAY_NAME_MAX) {
      ctx.addIssue({ code: 'custom', message: i18n.t('validation.dayNameTooLong', { name: dayName(day, index).slice(0, 30), max: DAY_NAME_MAX }) })
    } else if (day.exercises.length === 0) {
      // A day with no exercises would publish as an empty block on the routine page.
      ctx.addIssue({ code: 'custom', message: i18n.t('admin.routines.hasNoExercises', { name: dayName(day, index) }) })
    } else if (!day.exercises.every(exerciseIsValid)) {
      ctx.addIssue({ code: 'custom', message: i18n.t('validation.dayExercisesInvalid', { name: dayName(day, index) }) })
    }
  })
})

export const adminRoutineSchema = z.object({
  title: requiredText('common.titleIsRequired', ROUTINE_TITLE_MAX),
  description: z.string().trim().min(1, msg('admin.routines.describeTheProgrammeInASentence')),
  goal: z.string().min(1, msg('validation.required')),
  level: z.string().min(1, msg('validation.required')),
  daysPerWeek: requiredNumber(wholeBetween(1, 7)),
  isPublic: z.boolean(),
  imageUrl: optionalHttpUrl(),
  days: programme,
})

export type AdminRoutineInput = z.input<typeof adminRoutineSchema>
/** Also the `RoutineForm` the admin service sends (types/routines.ts). */
export type AdminRoutineValues = z.output<typeof adminRoutineSchema>
