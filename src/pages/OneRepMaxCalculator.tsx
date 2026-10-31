import { useTranslation } from 'react-i18next'
import { useState, type FormEvent } from 'react'
import {
  CalculateButton,
  CalculatorHeader,
  FormError,
  NumberInput,
  toNumber,
  useCalculatorUnit,
} from '../components/calculators/shared'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useOneRepMax } from '../hooks/useCalculators'
import { fieldErrorsOf } from '../services/http'

export default function OneRepMaxCalculator() {
  const { t } = useTranslation()
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const calculation = useOneRepMax()
  const { unit, setUnit, weightLabel } = useCalculatorUnit(() => {
    setWeight('')
    calculation.reset()
  })

  const errors = fieldErrorsOf(calculation.error)
  const result = calculation.data

  const submit = (event: FormEvent) => {
    event.preventDefault()
    calculation.mutate({ weight: toNumber(weight), reps: toNumber(reps) })
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader
        title={t('common.x1rmCalculator')}
        description={t('common.estimateYourOneRepMaxTo')}
        action={<UnitToggle unit={unit} onChange={setUnit} imperialLabel="lbs" metricLabel="kg" />}
      />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <NumberInput id="weight" label={t('calculators.oneRepMax.weightLifted', { unit: weightLabel })} value={weight} onChange={setWeight} error={errors.weight} />
          <NumberInput id="reps" label={t('calculators.oneRepMax.repsPerformed')} value={reps} onChange={setReps} error={errors.reps} />
        </div>
        <CalculateButton pending={calculation.isPending} />
        <FormError error={calculation.error} />
      </form>

      {result ? (
        <>
          <section className="bg-primary-fixed rounded-xl p-xl text-center mb-xl border border-outline-variant">
            <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">
              {t('calculators.oneRepMax.estimated1RepMax')}
            </span>
            <p className="font-display-stat text-display-stat text-primary mt-sm">
              {result.one_rep_max} {weightLabel}
            </p>
            <p className="font-label-sm text-label-sm text-on-primary-fixed-variant mt-sm flex items-center justify-center gap-xs">
              <Icon name="info" size={16} />
              {t('calculators.oneRepMax.epleyFormula')}
            </p>
            {result.low_accuracy ? (
              <p className="font-label-sm text-label-sm text-on-primary-fixed-variant mt-sm">
                {t('calculators.oneRepMax.aboveAbout12RepsTheEstimate')}
              </p>
            ) : null}
          </section>

          <section className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant overflow-hidden">
            <h2 className="font-headline-md text-headline-md text-on-surface p-lg pb-md">{t('calculators.oneRepMax.trainingPercentages')}</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low border-y border-surface-variant">
                  <th className="py-sm px-lg font-label-bold text-label-bold text-on-surface-variant">{t('calculators.oneRepMax.of1rm')}</th>
                  <th className="py-sm px-lg font-label-bold text-label-bold text-on-surface-variant">{t('calculators.oneRepMax.load')}</th>
                  <th className="py-sm px-lg font-label-bold text-label-bold text-on-surface-variant text-right">{t('calculators.oneRepMax.typicalReps')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {result.zones.map((zone) => (
                  <tr key={zone.percent} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-sm px-lg font-body-md text-body-md text-secondary">{zone.percent}%</td>
                    <td className="py-sm px-lg font-label-bold text-label-bold text-on-surface">{zone.load}</td>
                    <td className="py-sm px-lg font-body-md text-body-md text-secondary text-right">
                      {zone.typical_reps} {zone.typical_reps === 1 ? 'rep' : t('common.reps2')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </div>
  )
}
