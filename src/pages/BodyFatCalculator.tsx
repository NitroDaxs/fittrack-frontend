import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalculateButton, CalculatorHeader, HeightInput, NumberInput, SexToggle, useCalculatorUnit } from '../components/calculators/shared'
import { bodyFatSchema, emptyHeight, type BodyFatInput } from '../schemas/calculators.schema'
import type { Units } from '../types/shared'
import UnitToggle from '../components/ui/UnitToggle'
import { useBodyFat } from '../hooks/useCalculators'
import type { BodyFatCategory, Sex } from '../types/calculators'

const categoryLabels: Record<BodyFatCategory, string> = {
  essential_fat: 'calculators.bodyFat.essentialFat',
  athletic: 'calculators.bodyFat.athletic',
  fitness: 'calculators.bodyFat.fitness',
  average: 'calculators.bodyFat.average',
  above_average: 'calculators.bodyFat.aboveAverage',
}

const blank = (units: Units, sex: Sex = 'male'): BodyFatInput => ({ units, sex, neck: '', waist: '', hip: '', ...emptyHeight })

export default function BodyFatCalculator() {
  const { t } = useTranslation()
  const calculation = useBodyFat()
  const { unit, setUnit, lengthLabel } = useCalculatorUnit((next) => {
    reset(blank(next, getValues('sex')))
    calculation.reset()
  })
  const { register, control, handleSubmit, reset, getValues, watch, formState: { errors } } = useForm({
    resolver: zodResolver(bodyFatSchema),
    mode: 'onTouched',
    defaultValues: blank(unit),
  })
  const sex = watch('sex')

  const result = calculation.data
  // Hip only counts for women; a value left over from switching is not sent.
  const submit = handleSubmit((values) => calculation.mutate({ ...values, hip: values.sex === 'female' ? values.hip : null }))

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader
        title={t('common.bodyFatEstimator')}
        description={t('calculators.bodyFat.estimateBodyFatWithTheUs')}
        action={<UnitToggle unit={unit} onChange={setUnit} imperialLabel="ft-in" metricLabel="cm" />}
      />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <Controller
          control={control}
          name="sex"
          render={({ field }) => (
            <SexToggle
              value={field.value}
              onChange={(next) => {
                field.onChange(next)
                calculation.reset()
              }}
            />
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <HeightInput
            feet={register('height_feet')}
            inches={register('height_inches')}
            cm={register('height_cm')}
            errors={{ height_feet: errors.height_feet?.message, height_inches: errors.height_inches?.message, height_cm: errors.height_cm?.message }}
          />
          <NumberInput id="neck" label={t('calculators.bodyFat.neck', { unit: lengthLabel })} error={errors.neck?.message} {...register('neck')} />
          <NumberInput id="waist" label={t('calculators.bodyFat.waistAtTheNavel', { unit: lengthLabel })} error={errors.waist?.message} {...register('waist')} />
          {sex === 'female' ? (
            <NumberInput id="hip" label={t('calculators.bodyFat.hipAtTheWidestPoint', { unit: lengthLabel })} error={errors.hip?.message} {...register('hip')} />
          ) : null}
        </div>
        <CalculateButton pending={calculation.isPending} />
      </form>

      {result ? (
        <section className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
          <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">
            {t('calculators.bodyFat.estimatedBodyFat')}
          </span>
          <p className="font-display-stat text-display-stat text-primary mt-sm">{result.body_fat.toFixed(1)}%</p>
          <p className="font-label-bold text-label-bold text-on-primary-fixed-variant mt-sm">{t(categoryLabels[result.category])}</p>
        </section>
      ) : null}

      <p className="font-label-sm text-label-sm text-secondary mt-lg text-center max-w-xl mx-auto">
        {t('calculators.bodyFat.tapeMeasurementsAreARoughEstimate')}
      </p>
    </div>
  )
}
