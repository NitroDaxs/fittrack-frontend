import { endpoints } from './endpoints'
import { post } from './http'
import type {
  BmiRequest,
  BmiResult,
  BodyFatRequest,
  BodyFatResult,
  MacroRequest,
  MacroResult,
  OneRepMaxRequest,
  OneRepMaxResult,
  TdeeRequest,
  TdeeResult,
} from '../types/calculators'

export const calculatorService = {
  oneRepMax: (body: OneRepMaxRequest) => post<OneRepMaxResult>(endpoints.calculators.oneRepMax, body),
  bmi: (body: BmiRequest) => post<BmiResult>(endpoints.calculators.bmi, body),
  tdee: (body: TdeeRequest) => post<TdeeResult>(endpoints.calculators.tdee, body),
  macros: (body: MacroRequest) => post<MacroResult>(endpoints.calculators.macros, body),
  bodyFat: (body: BodyFatRequest) => post<BodyFatResult>(endpoints.calculators.bodyFat, body),
}
