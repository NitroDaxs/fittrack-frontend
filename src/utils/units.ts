import type { Units } from '../types/shared'

export const KG_PER_LB = 0.453592
export const CM_PER_IN = 2.54

export const lbsToKg = (lbs: number) => lbs * KG_PER_LB
export const kgToLbs = (kg: number) => kg / KG_PER_LB
export const inToCm = (inches: number) => inches * CM_PER_IN
export const cmToIn = (cm: number) => cm / CM_PER_IN

/**
 * Display helpers for one unit preference.
 *
 * Measurement data itself is always imperial -- the API stores weights in lbs
 * and tape measurements in inches, and nothing here changes that. The
 * preference is purely a display layer: values go through `showWeight` /
 * `showLength` on the way to the screen, and anything typed by the user goes
 * back through `toStoredWeight` / `toStoredLength` before being submitted.
 *
 * Keeping the conversion at the edges (render and submit) rather than in state
 * means a unit switch never has to migrate data that is already in memory.
 */
export type Numeric = number | string | null | undefined

/** Trims the noise off converted values: 83.91452 -> 83.9, 84.0 -> 84. */
const round1 = (value: number): number => Number(value.toFixed(1))

const isEmpty = (value: Numeric): value is null | undefined | '' => value == null || value === ''

export function unitFormat(unit: Units) {
  const isMetric = unit === 'metric'

  // Stored (lbs / in) -> displayed
  const showWeight = (lbs: Numeric) => (isEmpty(lbs) ? null : round1(isMetric ? lbsToKg(Number(lbs)) : Number(lbs)))
  const showLength = (inches: Numeric) => (isEmpty(inches) ? null : round1(isMetric ? inToCm(Number(inches)) : Number(inches)))

  // Displayed -> stored (lbs / in)
  const toStoredWeight = (shown: Numeric) => (isEmpty(shown) ? null : round1(isMetric ? kgToLbs(Number(shown)) : Number(shown)))
  const toStoredLength = (shown: Numeric) => (isEmpty(shown) ? null : round1(isMetric ? cmToIn(Number(shown)) : Number(shown)))

  const weightLabel = isMetric ? 'kg' : 'lbs'
  const lengthLabel = isMetric ? 'cm' : 'in'

  return {
    unit,
    isMetric,
    weightLabel,
    lengthLabel,
    showWeight,
    showLength,
    toStoredWeight,
    toStoredLength,
    /** "83.9 kg" -- em dash when the value is missing, so callers don't each invent a placeholder. */
    formatWeight: (lbs: Numeric) => {
      const shown = showWeight(lbs)
      return shown == null ? '—' : `${shown} ${weightLabel}`
    },
    formatLength: (inches: Numeric) => {
      const shown = showLength(inches)
      return shown == null ? '—' : `${shown} ${lengthLabel}`
    },
  }
}

export type UnitFormat = ReturnType<typeof unitFormat>
