import { useState, type FormEvent } from 'react'
import {
  CalculateButton,
  CalculatorHeader,
  emptyHeight,
  FormError,
  heightRequest,
  HeightInput,
  NumberInput,
  SexToggle,
  toNumber,
  useCalculatorUnit,
} from '../components/calculators/shared'
import UnitToggle from '../components/ui/UnitToggle'
import { useBodyFat } from '../hooks/useCalculators'
import type { BodyFatCategory, Sex } from '../types/calculators'
import { fieldErrorsOf } from '../services/http'

const categoryLabels: Record<BodyFatCategory, string> = {
  essential_fat: 'Essential fat',
  athletic: 'Athletic',
  fitness: 'Fitness',
  average: 'Average',
  above_average: 'Above average',
}

export default function BodyFatCalculator() {
  const [sex, setSex] = useState<Sex>('male')
  const [height, setHeight] = useState(emptyHeight)
  const [neck, setNeck] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const calculation = useBodyFat()
  const { unit, setUnit, lengthLabel } = useCalculatorUnit(() => {
    setHeight(emptyHeight)
    setNeck('')
    setWaist('')
    setHip('')
    calculation.reset()
  })

  const errors = fieldErrorsOf(calculation.error)
  const result = calculation.data

  const submit = (event: FormEvent) => {
    event.preventDefault()
    calculation.mutate({
      units: unit,
      sex,
      neck: toNumber(neck),
      waist: toNumber(waist),
      hip: sex === 'female' ? toNumber(hip) : null,
      ...heightRequest(height),
    })
  }

  const changeSex = (next: Sex) => {
    setSex(next)
    calculation.reset()
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader
        title="Body Fat % Estimator"
        description="Estimate body fat with the US Navy tape-measurement method."
        action={<UnitToggle unit={unit} onChange={setUnit} imperialLabel="ft-in" metricLabel="cm" />}
      />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <SexToggle value={sex} onChange={changeSex} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <HeightInput value={height} onChange={setHeight} errors={errors} />
          <NumberInput id="neck" label={`Neck (${lengthLabel})`} value={neck} onChange={setNeck} error={errors.neck} />
          <NumberInput id="waist" label={`Waist (${lengthLabel}), at the navel`} value={waist} onChange={setWaist} error={errors.waist} />
          {sex === 'female' ? (
            <NumberInput id="hip" label={`Hip (${lengthLabel}), at the widest point`} value={hip} onChange={setHip} error={errors.hip} />
          ) : null}
        </div>
        <CalculateButton pending={calculation.isPending} />
        <FormError error={calculation.error} />
      </form>

      {result ? (
        <section className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
          <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">
            Estimated Body Fat
          </span>
          <p className="font-display-stat text-display-stat text-primary mt-sm">{result.body_fat.toFixed(1)}%</p>
          <p className="font-label-bold text-label-bold text-on-primary-fixed-variant mt-sm">{categoryLabels[result.category]}</p>
        </section>
      ) : null}

      <p className="font-label-sm text-label-sm text-secondary mt-lg text-center max-w-xl mx-auto">
        Tape measurements are a rough estimate — accuracy depends on consistent, taut (not tight) placement. For a
        precise reading, use DEXA or hydrostatic weighing.
      </p>
    </div>
  )
}
