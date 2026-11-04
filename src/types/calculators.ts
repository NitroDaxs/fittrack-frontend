import type { BmiValues, BodyFatValues, MacroValues, OneRepMaxValues, TdeeValues } from '../schemas/calculators.schema'

// Request bodies are the calculator forms' values: the schemas use the API's field
// names, so these are inferred from them rather than written out a second time.

export type Sex = BodyFatValues['sex']
export type ActivityLevel = TdeeValues['activity']
export type MacroSplit = MacroValues['split']
export type BmiCategory = 'underweight' | 'normal_weight' | 'overweight' | 'obese'
export type BodyFatCategory = 'essential_fat' | 'athletic' | 'fitness' | 'average' | 'above_average'

export type OneRepMaxRequest = OneRepMaxValues

export interface OneRepMaxResult {
  one_rep_max: number
  low_accuracy: boolean
  zones: { percent: number; load: number; typical_reps: number }[]
}

export type BmiRequest = BmiValues

export interface BmiResult {
  bmi: number
  category: BmiCategory
}

export type TdeeRequest = TdeeValues

export interface TdeeResult {
  tdee: number
  bmr: number
  activity_calories: number
  cut: number
  lean_bulk: number
}

export type MacroRequest = MacroValues

export interface MacroResult {
  calories: number
  targets: { macro: 'protein' | 'carbs' | 'fat'; percent: number; grams: number }[]
}

export type BodyFatRequest = BodyFatValues

export interface BodyFatResult {
  body_fat: number
  category: BodyFatCategory
}
