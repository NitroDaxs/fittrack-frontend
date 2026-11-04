import { describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { errorsOf, parse } from '../test/zod'
import { bmiSchema, bodyFatSchema, emptyHeight, macroSchema, oneRepMaxSchema, tdeeSchema } from './calculators.schema'
import { MAX_BODY_FAT, MAX_LENGTH, MAX_WEIGHT, measurementSchema } from './measurement.schema'

const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

describe('oneRepMaxSchema', () => {
  it('parses weight and reps', () => {
    expect(parse(oneRepMaxSchema, { weight: '100', reps: '5' })).toEqual({ weight: 100, reps: 5 })
  })

  it('limits reps to whole numbers from 1 to 20', () => {
    const message = t('validation.wholeBetween', { min: 1, max: 20 })
    expect(errorsOf(oneRepMaxSchema, { weight: '100', reps: '21' })).toEqual({ reps: message })
    expect(errorsOf(oneRepMaxSchema, { weight: '100', reps: '2.5' })).toEqual({ reps: message })
  })

  it('requires both fields', () => {
    expect(errorsOf(oneRepMaxSchema, { weight: '', reps: '' })).toEqual({
      weight: t('validation.required'),
      reps: t('validation.required'),
    })
  })
})

describe('bmiSchema (height handling)', () => {
  it('accepts metric height in cm', () => {
    expect(parse(bmiSchema, { units: 'metric', ...emptyHeight, height_cm: '180', weight: '80' })).toEqual({
      units: 'metric',
      height_cm: 180,
      height_feet: null,
      height_inches: null,
      weight: 80,
    })
  })

  it('requires cm when metric', () => {
    expect(errorsOf(bmiSchema, { units: 'metric', ...emptyHeight, weight: '80' })).toEqual({
      height_cm: t('validation.heightRequired'),
    })
  })

  it('accepts imperial height in feet only or inches only', () => {
    expect(errorsOf(bmiSchema, { units: 'imperial', ...emptyHeight, height_feet: '6', weight: '180' })).toBeNull()
    expect(errorsOf(bmiSchema, { units: 'imperial', ...emptyHeight, height_inches: '70', weight: '180' })).toEqual({
      height_inches: t('validation.between', { min: 0, max: 11.99 }),
    })
    expect(errorsOf(bmiSchema, { units: 'imperial', ...emptyHeight, height_inches: '11', weight: '180' })).toBeNull()
  })

  it('requires a non-zero imperial height, reported on feet', () => {
    expect(errorsOf(bmiSchema, { units: 'imperial', ...emptyHeight, weight: '180' })).toEqual({
      height_feet: t('validation.heightRequired'),
    })
    expect(errorsOf(bmiSchema, { units: 'imperial', height_feet: '0', height_inches: '0', height_cm: '', weight: '180' })).toEqual({
      height_feet: t('validation.heightRequired'),
    })
  })

  it('shows the height error alongside other field errors', () => {
    expect(errorsOf(bmiSchema, { units: 'metric', ...emptyHeight, weight: '' })).toEqual({
      height_cm: t('validation.heightRequired'),
      weight: t('validation.required'),
    })
  })
})

describe('tdeeSchema', () => {
  const valid = { units: 'metric', ...emptyHeight, height_cm: '175', sex: 'male', age: '30', weight: '75', activity: 'moderate' }

  it('accepts a full form', () => {
    expect(errorsOf(tdeeSchema, valid)).toBeNull()
  })

  it('requires an activity level with a specific message', () => {
    expect(errorsOf(tdeeSchema, { ...valid, activity: '' })).toEqual({ activity: t('validation.activityRequired') })
  })

  it('limits age to 1-120 whole years', () => {
    expect(errorsOf(tdeeSchema, { ...valid, age: '121' })).toEqual({ age: t('validation.wholeBetween', { min: 1, max: 120 }) })
  })
})

describe('macroSchema', () => {
  it('accepts calories and a split', () => {
    expect(parse(macroSchema, { calories: '2500', split: 'keto' })).toEqual({ calories: 2500, split: 'keto' })
  })

  it('requires a split with a specific message', () => {
    expect(errorsOf(macroSchema, { calories: '2500', split: '' })).toEqual({ split: t('validation.splitRequired') })
  })

  it('limits calories', () => {
    expect(errorsOf(macroSchema, { calories: '20001', split: 'balanced' })?.calories).toBe(
      t('validation.wholeBetween', { min: 1, max: 20000 }),
    )
  })
})

describe('bodyFatSchema', () => {
  const male = { units: 'metric', ...emptyHeight, height_cm: '180', sex: 'male', neck: '38', waist: '85', hip: '' }

  it('does not need a hip measurement for men', () => {
    expect(parse(bodyFatSchema, male).hip).toBeNull()
  })

  it('needs a hip measurement for women', () => {
    expect(errorsOf(bodyFatSchema, { ...male, sex: 'female' })).toEqual({ hip: t('validation.hipRequired') })
    expect(errorsOf(bodyFatSchema, { ...male, sex: 'female', hip: '95' })).toBeNull()
  })

  it('requires the waist to be larger than the neck', () => {
    expect(errorsOf(bodyFatSchema, { ...male, waist: '38' })).toEqual({ waist: t('validation.waistLargerThanNeck') })
    expect(errorsOf(bodyFatSchema, { ...male, waist: '30' })).toEqual({ waist: t('validation.waistLargerThanNeck') })
  })

  it('reports height, hip and waist problems together', () => {
    expect(errorsOf(bodyFatSchema, { ...male, height_cm: '', sex: 'female', waist: '30' })).toEqual({
      height_cm: t('validation.heightRequired'),
      hip: t('validation.hipRequired'),
      waist: t('validation.waistLargerThanNeck'),
    })
  })
})

describe('measurementSchema', () => {
  const blank = { weight: '180', bodyFat: '', waist: '', chest: '', arms: '' }

  it('needs only the weight; other values become null', () => {
    expect(parse(measurementSchema('imperial'), blank)).toEqual({ weight: 180, bodyFat: null, waist: null, chest: null, arms: null })
  })

  it('requires the weight with its own message', () => {
    expect(errorsOf(measurementSchema('imperial'), { ...blank, weight: '' })).toEqual({
      weight: t('bodyMeasurements.weightIsRequired'),
    })
  })

  it('caps the weight per unit', () => {
    expect(errorsOf(measurementSchema('imperial'), { ...blank, weight: String(MAX_WEIGHT.imperial) })).toBeNull()
    expect(errorsOf(measurementSchema('metric'), { ...blank, weight: String(MAX_WEIGHT.imperial) })).toEqual({
      weight: t('validation.between', { min: 0.1, max: MAX_WEIGHT.metric }),
    })
  })

  it('limits body fat to 0-70%', () => {
    expect(errorsOf(measurementSchema('metric'), { ...blank, bodyFat: '0' })).toBeNull()
    expect(errorsOf(measurementSchema('metric'), { ...blank, bodyFat: String(MAX_BODY_FAT + 1) })).toEqual({
      bodyFat: t('bodyMeasurements.bodyFatShouldBeBetween0'),
    })
  })

  it('limits tape measurements', () => {
    expect(errorsOf(measurementSchema('metric'), { ...blank, waist: String(MAX_LENGTH + 1), arms: '0' })).toEqual({
      waist: t('validation.between', { min: 0.1, max: MAX_LENGTH }),
      arms: t('validation.between', { min: 0.1, max: MAX_LENGTH }),
    })
  })
})
