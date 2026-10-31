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
  underweight: { label: 'Underweight', tone: 'text-secondary' },
  normal_weight: { label: 'Normal weight', tone: 'text-primary' },
  overweight: { label: 'Overweight', tone: 'text-tertiary' },
  obese: { label: 'Obese', tone: 'text-error' },
}

export default function BmiCalculator() {
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
        title="BMI Calculator"
        description="A rough population-level screen for body composition based on height and weight."
        action={<UnitToggle unit={unit} onChange={setUnit} />}
      />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <HeightInput value={height} onChange={setHeight} errors={errors} />
          <NumberInput id="weight" label={`Weight (${weightLabel})`} value={weight} onChange={setWeight} error={errors.weight} />
        </div>
        <CalculateButton pending={calculation.isPending} />
        <FormError error={calculation.error} />
      </form>

      {result ? (
        <section className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
          <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">Your BMI</span>
          <p className="font-display-stat text-display-stat text-primary mt-sm">{result.bmi.toFixed(1)}</p>
          <p className={`font-label-bold text-label-bold mt-sm ${categories[result.category].tone}`}>
            {categories[result.category].label}
          </p>
        </section>
      ) : null}

      <p className="font-label-sm text-label-sm text-secondary mt-lg text-center max-w-xl mx-auto">
        BMI doesn't distinguish muscle from fat, so it can misclassify muscular or very lean people. Treat it as a
        starting point, not a diagnosis.
      </p>
    </div>
  )
}
