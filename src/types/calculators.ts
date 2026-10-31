import type { Units } from './shared'

// Blank inputs are sent as null, and the API replies with a message for each one it needs.
type Input = number | null

export type Sex = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'athlete'
export type MacroSplit = 'balanced' | 'high_protein' | 'low_carb' | 'keto'
export type BmiCategory = 'underweight' | 'normal_weight' | 'overweight' | 'obese'
export type BodyFatCategory = 'essential_fat' | 'athletic' | 'fitness' | 'average' | 'above_average'

export interface OneRepMaxRequest {
  weight: Input
  reps: Input
}

export interface OneRepMaxResult {
  one_rep_max: number
  low_accuracy: boolean
  zones: { percent: number; load: number; typical_reps: number }[]
}

export interface BodyHeightRequest {
  units: Units
  height_feet: Input
  height_inches: Input
  height_cm: Input
}

export interface BmiRequest extends BodyHeightRequest {
  weight: Input
}

export interface BmiResult {
  bmi: number
  category: BmiCategory
}

export interface TdeeRequest extends BmiRequest {
  sex: Sex
  age: Input
  activity: ActivityLevel | null
}

export interface TdeeResult {
  tdee: number
  bmr: number
  activity_calories: number
  cut: number
  lean_bulk: number
}

export interface MacroRequest {
  calories: Input
  split: MacroSplit | null
}

export interface MacroResult {
  calories: number
  targets: { macro: 'protein' | 'carbs' | 'fat'; percent: number; grams: number }[]
}

export interface BodyFatRequest extends BodyHeightRequest {
  sex: Sex
  neck: Input
  waist: Input
  hip: Input
}

export interface BodyFatResult {
  body_fat: number
  category: BodyFatCategory
}
