import * as z from 'zod'
import { msg, optionalHttpUrl, requiredText } from './shared'

export const adminExerciseSchema = z.object({
  name: requiredText('common.nameIsRequired'),
  description: z.string().trim().min(1, msg('admin.exercises.giveItAOneLineDescription')),
  instructions: z.string().trim(),
  muscleGroups: z.array(z.string()).min(1, msg('admin.exercises.pickAtLeastOneMuscleGroup')),
  equipmentList: z.array(z.string()),
  difficulty: z.string().min(1, msg('validation.required')),
  category: z.string().min(1, msg('validation.required')),
  primaryMuscles: z.string().trim(),
  videoUrl: optionalHttpUrl(),
  thumbnailUrl: optionalHttpUrl(),
})

/** Also the `ExerciseForm` the admin service sends (types/exercises.ts). */
export type AdminExerciseValues = z.infer<typeof adminExerciseSchema>
