import { useMutation } from '@tanstack/react-query'
import { calculatorService } from '../services/calculators'

// Calculations are writes in shape only: nothing to cache, so each one is a mutation
// the page triggers when the person submits the form.
export const useOneRepMax = () => useMutation({ mutationFn: calculatorService.oneRepMax })
export const useBmi = () => useMutation({ mutationFn: calculatorService.bmi })
export const useTdee = () => useMutation({ mutationFn: calculatorService.tdee })
export const useMacros = () => useMutation({ mutationFn: calculatorService.macros })
export const useBodyFat = () => useMutation({ mutationFn: calculatorService.bodyFat })
