import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UnitProvider } from '../context/UnitContext'
import { calculators } from '../data/calculators'
import i18n from '../i18n'
import { renderWithProviders } from '../test/utils'
import BmiCalculator from './BmiCalculator'
import BodyFatCalculator from './BodyFatCalculator'
import CalculatorsHub from './CalculatorsHub'
import MacroCalculator from './MacroCalculator'
import OneRepMaxCalculator from './OneRepMaxCalculator'
import TdeeCalculator from './TdeeCalculator'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../context/AuthContext', () => ({ useAuth: () => ({ isAuthenticated: false }) }))
vi.mock('../services/calculators', () => ({
  calculatorService: { oneRepMax: vi.fn(), bmi: vi.fn(), tdee: vi.fn(), macros: vi.fn(), bodyFat: vi.fn() },
}))

const { calculatorService } = await import('../services/calculators')
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

const renderCalculator = (ui: ReactNode) => renderWithProviders(<UnitProvider>{ui}</UnitProvider>)
const calculate = () => userEvent.click(screen.getByRole('button', { name: t('calculators.shared.calculate') }))
const sentBody = (fn: (...args: never[]) => unknown) => vi.mocked(fn).mock.calls[0][0]

beforeEach(() => {
  for (const fn of Object.values(calculatorService)) vi.mocked(fn).mockReset()
})

describe('CalculatorsHub', () => {
  it('links to every calculator', () => {
    renderWithProviders(<CalculatorsHub />)
    for (const calculator of calculators) {
      expect(screen.getByRole('link', { name: new RegExp(t(calculator.name)) })).toHaveAttribute(
        'href',
        `/calculators/${calculator.slug}`,
      )
    }
  })
})

describe('OneRepMaxCalculator', () => {
  const result = {
    one_rep_max: 116.7,
    low_accuracy: false,
    zones: [
      { percent: 100, load: 116.7, typical_reps: 1 },
      { percent: 80, load: 93.4, typical_reps: 8 },
    ],
  }

  it('validates the inputs', async () => {
    renderCalculator(<OneRepMaxCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.repsPerformed')), '30')
    await calculate()
    expect(await screen.findByText(t('validation.required'))).toBeInTheDocument()
    expect(screen.getByText(t('validation.wholeBetween', { min: 1, max: 20 }))).toBeInTheDocument()
    expect(calculatorService.oneRepMax).not.toHaveBeenCalled()
  })

  it('shows the estimate and training zones', async () => {
    vi.mocked(calculatorService.oneRepMax).mockResolvedValue(result)
    renderCalculator(<OneRepMaxCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.weightLifted', { unit: 'lbs' })), '100')
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.repsPerformed')), '5')
    await calculate()

    expect(await screen.findByText('116.7 lbs')).toBeInTheDocument()
    expect(sentBody(calculatorService.oneRepMax)).toEqual({ weight: 100, reps: 5 })
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByText('1 rep')).toBeInTheDocument()
    expect(screen.getByText(`8 ${t('common.reps2')}`)).toBeInTheDocument()
    expect(screen.queryByText(t('calculators.oneRepMax.aboveAbout12RepsTheEstimate'))).not.toBeInTheDocument()
  })

  it('warns about low accuracy', async () => {
    vi.mocked(calculatorService.oneRepMax).mockResolvedValue({ ...result, low_accuracy: true })
    renderCalculator(<OneRepMaxCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.weightLifted', { unit: 'lbs' })), '100')
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.repsPerformed')), '15')
    await calculate()
    expect(await screen.findByText(t('calculators.oneRepMax.aboveAbout12RepsTheEstimate'))).toBeInTheDocument()
  })

  it('switching units clears the weight and the result but keeps reps', async () => {
    vi.mocked(calculatorService.oneRepMax).mockResolvedValue(result)
    renderCalculator(<OneRepMaxCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.weightLifted', { unit: 'lbs' })), '100')
    await userEvent.type(screen.getByLabelText(t('calculators.oneRepMax.repsPerformed')), '5')
    await calculate()
    await screen.findByText('116.7 lbs')

    await userEvent.click(screen.getByRole('button', { name: 'kg' }))
    expect(screen.getByLabelText(t('calculators.oneRepMax.weightLifted', { unit: 'kg' }))).toHaveValue(null)
    expect(screen.getByLabelText(t('calculators.oneRepMax.repsPerformed'))).toHaveValue(5)
    expect(screen.queryByText(/116\.7/)).not.toBeInTheDocument()
  })
})

describe('BmiCalculator', () => {
  it('sends imperial height and shows the category', async () => {
    vi.mocked(calculatorService.bmi).mockResolvedValue({ bmi: 24.42, category: 'normal_weight' })
    renderCalculator(<BmiCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.shared.heightInFeet')), '5')
    await userEvent.type(screen.getByLabelText(t('calculators.shared.heightInInches')), '11')
    await userEvent.type(screen.getByLabelText(t('common.weight', { unit: 'lbs' })), '170')
    await calculate()

    expect(await screen.findByText('24.4')).toBeInTheDocument()
    expect(screen.getByText(t('calculators.bmi.normalWeight'))).toBeInTheDocument()
    expect(sentBody(calculatorService.bmi)).toEqual({ units: 'imperial', height_feet: 5, height_inches: 11, height_cm: null, weight: 170 })
  })

  it('asks for height in cm after switching to metric', async () => {
    renderCalculator(<BmiCalculator />)
    await userEvent.click(screen.getByRole('button', { name: t('common.kgCm') }))
    expect(screen.queryByLabelText(t('calculators.shared.heightInFeet'))).not.toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(t('common.weight', { unit: 'kg' })), '70')
    await calculate()
    expect(await screen.findByText(t('validation.heightRequired'))).toBeInTheDocument()
    expect(calculatorService.bmi).not.toHaveBeenCalled()

    vi.mocked(calculatorService.bmi).mockResolvedValue({ bmi: 31, category: 'obese' })
    await userEvent.type(screen.getByLabelText(t('calculators.shared.heightInCentimeters')), '150')
    await calculate()
    expect(await screen.findByText(t('calculators.bmi.obese'))).toBeInTheDocument()
    expect(sentBody(calculatorService.bmi)).toMatchObject({ units: 'metric', height_cm: 150, weight: 70 })
  })
})

describe('TdeeCalculator', () => {
  it('requires an activity level, then shows the breakdown', async () => {
    vi.mocked(calculatorService.tdee).mockResolvedValue({ tdee: 2650, bmr: 1700, activity_calories: 950, cut: 2150, lean_bulk: 2900 })
    renderCalculator(<TdeeCalculator />)
    await userEvent.click(screen.getByRole('button', { name: t('common.sex.female') }))
    await userEvent.type(screen.getByLabelText(t('calculators.tdee.age')), '30')
    await userEvent.type(screen.getByLabelText(t('common.weight', { unit: 'lbs' })), '150')
    await userEvent.type(screen.getByLabelText(t('calculators.shared.heightInFeet')), '5')
    await calculate()
    expect(await screen.findByText(t('validation.activityRequired'))).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText(t('calculators.tdee.activityLevel')), 'moderate')
    await calculate()
    expect(await screen.findByText((2650).toLocaleString('en'))).toBeInTheDocument()
    expect(screen.getByText(`${(1700).toLocaleString('en')} kcal`)).toBeInTheDocument()
    expect(sentBody(calculatorService.tdee)).toEqual({
      units: 'imperial',
      sex: 'female',
      age: 30,
      weight: 150,
      activity: 'moderate',
      height_feet: 5,
      height_inches: null,
      height_cm: null,
    })
  })

  it('switching units clears measurements but keeps age', async () => {
    renderCalculator(<TdeeCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.tdee.age')), '30')
    await userEvent.type(screen.getByLabelText(t('common.weight', { unit: 'lbs' })), '150')
    await userEvent.click(screen.getByRole('button', { name: t('common.kgCm') }))
    expect(screen.getByLabelText(t('common.weight', { unit: 'kg' }))).toHaveValue(null)
    expect(screen.getByLabelText(t('calculators.tdee.age'))).toHaveValue(30)
  })
})

describe('MacroCalculator', () => {
  it('requires a split, then shows each macro', async () => {
    vi.mocked(calculatorService.macros).mockResolvedValue({
      calories: 2500,
      targets: [
        { macro: 'protein', percent: 30, grams: 188 },
        { macro: 'carbs', percent: 40, grams: 250 },
        { macro: 'fat', percent: 30, grams: 83 },
      ],
    })
    renderWithProviders(<MacroCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.macro.dailyCalories')), '2500')
    await calculate()
    expect(await screen.findByText(t('validation.splitRequired'))).toBeInTheDocument()

    const highProtein = screen.getByRole('button', { name: t('calculators.macro.highProtein') })
    await userEvent.click(highProtein)
    expect(highProtein).toHaveAttribute('aria-pressed', 'true')
    await calculate()

    expect(await screen.findByText(t('calculators.macro.dailyTargets'))).toBeInTheDocument()
    expect(sentBody(calculatorService.macros)).toEqual({ calories: 2500, split: 'high_protein' })
    for (const macro of ['protein', 'carbs', 'fat']) {
      expect(screen.getAllByText(t(`calculators.macro.${macro}`)).length).toBeGreaterThan(0)
    }
  })
})

describe('BodyFatCalculator', () => {
  const fillMale = async () => {
    await userEvent.type(screen.getByLabelText(t('calculators.shared.heightInFeet')), '6')
    await userEvent.type(screen.getByLabelText(t('calculators.bodyFat.neck', { unit: 'in' })), '15')
    await userEvent.type(screen.getByLabelText(t('calculators.bodyFat.waistAtTheNavel', { unit: 'in' })), '34')
  }

  it('estimates for a man without a hip measurement', async () => {
    vi.mocked(calculatorService.bodyFat).mockResolvedValue({ body_fat: 17.26, category: 'fitness' })
    renderCalculator(<BodyFatCalculator />)
    expect(screen.queryByLabelText(t('calculators.bodyFat.hipAtTheWidestPoint', { unit: 'in' }))).not.toBeInTheDocument()
    await fillMale()
    await calculate()
    expect(await screen.findByText('17.3%')).toBeInTheDocument()
    expect(screen.getByText(t('calculators.bodyFat.fitness'))).toBeInTheDocument()
    expect(sentBody(calculatorService.bodyFat)).toMatchObject({ sex: 'male', neck: 15, waist: 34, hip: null })
  })

  it('asks women for the hip measurement', async () => {
    vi.mocked(calculatorService.bodyFat).mockResolvedValue({ body_fat: 25, category: 'average' })
    renderCalculator(<BodyFatCalculator />)
    await userEvent.click(screen.getByRole('button', { name: t('common.sex.female') }))
    await fillMale()
    await calculate()
    expect(await screen.findByText(t('validation.hipRequired'))).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(t('calculators.bodyFat.hipAtTheWidestPoint', { unit: 'in' })), '40')
    await calculate()
    await waitFor(() => expect(calculatorService.bodyFat).toHaveBeenCalled())
    expect(sentBody(calculatorService.bodyFat)).toMatchObject({ sex: 'female', hip: 40 })
  })

  it('does not send a hip value left over from switching back to male', async () => {
    vi.mocked(calculatorService.bodyFat).mockResolvedValue({ body_fat: 18, category: 'fitness' })
    renderCalculator(<BodyFatCalculator />)
    await userEvent.click(screen.getByRole('button', { name: t('common.sex.female') }))
    await userEvent.type(screen.getByLabelText(t('calculators.bodyFat.hipAtTheWidestPoint', { unit: 'in' })), '40')
    await userEvent.click(screen.getByRole('button', { name: t('common.sex.male') }))
    await fillMale()
    await calculate()
    await waitFor(() => expect(calculatorService.bodyFat).toHaveBeenCalled())
    expect(sentBody(calculatorService.bodyFat)).toMatchObject({ sex: 'male', hip: null })
  })

  it('checks that the waist is larger than the neck', async () => {
    renderCalculator(<BodyFatCalculator />)
    await userEvent.type(screen.getByLabelText(t('calculators.shared.heightInFeet')), '6')
    await userEvent.type(screen.getByLabelText(t('calculators.bodyFat.neck', { unit: 'in' })), '16')
    await userEvent.type(screen.getByLabelText(t('calculators.bodyFat.waistAtTheNavel', { unit: 'in' })), '15')
    await calculate()
    expect(await screen.findByText(t('validation.waistLargerThanNeck'))).toBeInTheDocument()
  })
})
