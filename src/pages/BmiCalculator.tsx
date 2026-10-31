import { useTranslation } from 'react-i18next'
import { useState, type FormEvent } from 'react'
import {
  CalculateButton,
  CalculatorHeader,
  emptyHeight,
  FormError,
  heightRequest,
  HeightInput,
  NumberInput,
  toNumber,
  useCalculatorUnit,
} from '../components/calculators/shared'
import UnitToggle from '../components/ui/UnitToggle'
import { useBmi } from '../hooks/useCalculators'
import type { BmiCategory } from '../types/calculators'
import { fieldErrorsOf } from '../services/http'

const categories: Record<BmiCategory, { label: string; tone: string }> = {
  underweight: { label: 'calculators.bmi.underweight', tone: 'text-secondary' },
  normal_weight: { label: 'calculators.bmi.normalWeight', tone: 'text-primary' },
  overweight: { label: 'calculators.bmi.overweight', tone: 'text-tertiary' },
  obese: { label: 'calculators.bmi.obese', tone: 'text-error' },
}

export default function BmiCalculator() {
  const { t } = useTranslation()
  const [height, setHeight] = useState(emptyHeight)
  const [weight, setWeight] = useState('')
  const calculation = useBmi()
  const { unit, setUnit, weightLabel } = useCalculatorUnit(() => {
    setHeight(emptyHeight)
    setWeight('')
    calculation.reset()
  })

  const errors = fieldErrorsOf(calculation.error)
  const result = calculation.data

  const submit = (event: FormEvent) => {
    event.preventDefault()
    calculation.mutate({ units: unit, weight: toNumber(weight), ...heightRequest(height) })
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader
        title={t('common.bmiCalculator')}
        description={t('calculators.bmi.aRoughPopulationLevelScreenFor')}
        action={<UnitToggle unit={unit} onChange={setUnit} />}
      />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <HeightInput value={height} onChange={setHeight} errors={errors} />
          <NumberInput id="weight" label={t('common.weight', { unit: weightLabel })} value={weight} onChange={setWeight} error={errors.weight} />
        </div>
        <CalculateButton pending={calculation.isPending} />
        <FormError error={calculation.error} />
      </form>

      {result ? (
        <section className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
          <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">{t('calculators.bmi.yourBmi')}</span>
          <p className="font-display-stat text-display-stat text-primary mt-sm">{result.bmi.toFixed(1)}</p>
          <p className={`font-label-bold text-label-bold mt-sm ${categories[result.category].tone}`}>
            {t(categories[result.category].label)}
          </p>
        </section>
      ) : null}

      <p className="font-label-sm text-label-sm text-secondary mt-lg text-center max-w-xl mx-auto">
        {t('calculators.bmi.bmiDoesnTDistinguishMuscleFrom')}
      </p>
    </div>
  )
}
