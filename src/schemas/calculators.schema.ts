import * as z from 'zod'
import i18n from '../i18n'
import { between, msg, optionalNumber, requiredNumber, wholeBetween } from './shared'

/**
 * Field names match the API request bodies, so a valid form is sent as it is,
 * and the request types in types/calculators.ts are inferred from these.
 * Ranges are the API's own; it rejects anything outside them.
 */

const units = z.enum(['metric', 'imperial'])
const sex = z.enum(['male', 'female'])

const heightSchema = z.object({
  units,
  height_feet: optionalNumber(between(0, 10)),
  height_inches: optionalNumber(between(0, 11.99)),
  height_cm: optionalNumber(between(1, 300)),
})

type Height = z.output<typeof heightSchema>

/**
 * Height lives in either one box (cm) or two (ft + in), so "required" depends
 * on the unit. `when` runs this even while other fields are still invalid, so
 * every missing field is shown at once; that is also why the values are checked
 * with `typeof` rather than trusted.
 */
function requireHeight<T extends z.ZodType<Height>>(schema: T) {
  return schema.check(
    z.superRefine(
      (value: Height, ctx) => {
        if (value.units === 'metric') {
          if (value.height_cm == null) ctx.addIssue({ code: 'custom', path: ['height_cm'], message: i18n.t('validation.heightRequired') })
          return
        }
        const feet = typeof value.height_feet === 'number' ? value.height_feet : 0
        const inches = typeof value.height_inches === 'number' ? value.height_inches : 0
        if (feet * 12 + inches <= 0) {
          ctx.addIssue({ code: 'custom', path: ['height_feet'], message: i18n.t('validation.heightRequired') })
        }
      },
      { when: () => true },
    ),
  )
}

export const oneRepMaxSchema = z.object({
  weight: requiredNumber(between(0.1, 5000)),
  reps: requiredNumber(wholeBetween(1, 20)),
})

export const bmiSchema = requireHeight(
  heightSchema.extend({
    weight: requiredNumber(between(0.1, 2000)),
  }),
)

export const tdeeSchema = requireHeight(
  heightSchema.extend({
    sex,
    age: requiredNumber(wholeBetween(1, 120)),
    weight: requiredNumber(between(0.1, 2000)),
    activity: z.enum(['sedentary', 'light', 'moderate', 'heavy', 'athlete'], msg('validation.activityRequired')),
  }),
)

export const macroSchema = z.object({
  calories: requiredNumber(wholeBetween(1, 20000)),
  split: z.enum(['balanced', 'high_protein', 'low_carb', 'keto'], msg('validation.splitRequired')),
})

const tapeLength = () => between(0.1, 500)

export const bodyFatSchema = requireHeight(
  heightSchema.extend({
    sex,
    neck: requiredNumber(tapeLength()),
    waist: requiredNumber(tapeLength()),
    hip: optionalNumber(tapeLength()),
  }),
).check(
  z.superRefine(
    (value, ctx) => {
      if (value.sex === 'female' && value.hip == null) {
        ctx.addIssue({ code: 'custom', path: ['hip'], message: i18n.t('validation.hipRequired') })
      }
      if (typeof value.neck === 'number' && typeof value.waist === 'number' && value.waist <= value.neck) {
        ctx.addIssue({ code: 'custom', path: ['waist'], message: i18n.t('validation.waistLargerThanNeck') })
      }
    },
    { when: () => true },
  ),
)

export type OneRepMaxInput = z.input<typeof oneRepMaxSchema>
export type OneRepMaxValues = z.output<typeof oneRepMaxSchema>
export type BmiInput = z.input<typeof bmiSchema>
export type BmiValues = z.output<typeof bmiSchema>
export type TdeeInput = z.input<typeof tdeeSchema>
export type TdeeValues = z.output<typeof tdeeSchema>
export type MacroInput = z.input<typeof macroSchema>
export type MacroValues = z.output<typeof macroSchema>
export type BodyFatInput = z.input<typeof bodyFatSchema>
export type BodyFatValues = z.output<typeof bodyFatSchema>

/** Blank height boxes for a form's default values. */
export const emptyHeight = { height_feet: '', height_inches: '', height_cm: '' }
