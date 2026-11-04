import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalculateButton, CalculatorHeader, HeightInput, NumberInput, useCalculatorUnit } from '../components/calculators/shared'
import { bmiSchema, emptyHeight, type BmiInput } from '../schemas/calculators.schema'
import type { Units } from '../types/shared'
import UnitToggle from '../components/ui/UnitToggle'
import { useBmi } from '../hooks/useCalculators'
import type { BmiCategory } from '../types/calculators'

const categories: Record<BmiCategory, { label: string; tone: string }> = {
  underweight: { label: 'calculators.bmi.underweight', tone: 'text-secondary' },
  normal_weight: { label: 'calculators.bmi.normalWeight', tone: 'text-primary' },
  overweight: { label: 'calculators.bmi.overweight', tone: 'text-tertiary' },
  obese: { label: 'calculators.bmi.obese', tone: 'text-error' },
}

const blank = (units: Units): BmiInput => ({ units, weight: '', ...emptyHeight })

export default function BmiCalculator() {
  const { t } = useTranslation()
  const calculation = useBmi()
  const { unit, setUnit, weightLabel } = useCalculatorUnit((next) => {
    reset(blank(next))
    calculation.reset()
  })
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(bmiSchema),
    mode: 'onTouched',
    defaultValues: blank(unit),
  })

  const result = calculation.data
  const submit = handleSubmit((values) => calculation.mutate(values))

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader
        title={t('common.bmiCalculator')}
        description={t('calculators.bmi.aRoughPopulationLevelScreenFor')}
        action={<UnitToggle unit={unit} onChange={setUnit} />}
      />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <HeightInput
            feet={register('height_feet')}
            inches={register('height_inches')}
            cm={register('height_cm')}
            errors={{ height_feet: errors.height_feet?.message, height_inches: errors.height_inches?.message, height_cm: errors.height_cm?.message }}
          />
          <NumberInput id="weight" label={t('common.weight', { unit: weightLabel })} error={errors.weight?.message} {...register('weight')} />
        </div>
        <CalculateButton pending={calculation.isPending} />
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
