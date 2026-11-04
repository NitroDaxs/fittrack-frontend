import * as z from 'zod'
import type { Units } from '../types/shared'
import { between, msg, optionalNumber, requiredNumber } from './shared'

/** The API stores lbs; 999 lbs is its ceiling, which is about 453 kg. */
export const MAX_WEIGHT = { imperial: 999, metric: 453 } as const
export const MAX_BODY_FAT = 70
/** The API stores inches; 500 is safe in either unit. */
export const MAX_LENGTH = 500

const length = () => optionalNumber(between(0.1, MAX_LENGTH))

/** Values are in the unit the user is looking at; the page converts them on submit. */
export const measurementSchema = (unit: Units) =>
  z.object({
    weight: requiredNumber(between(0.1, MAX_WEIGHT[unit]), 'bodyMeasurements.weightIsRequired'),
    bodyFat: optionalNumber(
      z
        .number()
        .min(0, msg('bodyMeasurements.bodyFatShouldBeBetween0'))
        .max(MAX_BODY_FAT, msg('bodyMeasurements.bodyFatShouldBeBetween0')),
    ),
    waist: length(),
    chest: length(),
    arms: length(),
  })

export type MeasurementInput = z.input<ReturnType<typeof measurementSchema>>
export type MeasurementValues = z.output<ReturnType<typeof measurementSchema>>
