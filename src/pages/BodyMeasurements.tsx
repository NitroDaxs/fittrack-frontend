import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index'
import type { IconName } from '../components/ui/Icon'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { measurementSchema, type MeasurementInput, type MeasurementValues } from '../schemas/measurement.schema'
import MeasurementChart from '../components/charts/MeasurementChart'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useSetUnit, useUnitFormat } from '../hooks/useUnits'
import { useLogMeasurement, useMeasurements } from '../hooks/useMe'

// `kind` drives both the label suffix and which converter runs on submit;
// body fat is a percentage and so belongs to neither unit system.
type FieldName = 'weight' | 'bodyFat' | 'waist' | 'chest' | 'arms'

const fields: { name: FieldName; label: string; kind: 'weight' | 'percent' | 'length'; step: string; icon: IconName }[] = [
  { name: 'weight', label: 'bodyMeasurements.weight', kind: 'weight', step: '0.1', icon: 'weight' },
  { name: 'bodyFat', label: 'bodyMeasurements.bodyFat', kind: 'percent', step: '0.1', icon: 'percent' },
  { name: 'waist', label: 'bodyMeasurements.waist', kind: 'length', step: '0.1', icon: 'ruler' },
  { name: 'chest', label: 'bodyMeasurements.chest', kind: 'length', step: '0.1', icon: 'ruler' },
  { name: 'arms', label: 'bodyMeasurements.arms', kind: 'length', step: '0.1', icon: 'ruler' },
]

const emptyForm: MeasurementInput = { weight: '', bodyFat: '', waist: '', chest: '', arms: '' }

function Delta({ current, previous, suffix = '' }: { current: number | null; previous: number | null; suffix?: string }) {
  if (previous == null || current == null) {
    return (
      <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
        <Icon name="minus" size={16} />—
      </span>
    )
  }
  const diff = Number((current - previous).toFixed(1))
  const icon = diff === 0 ? 'minus' : diff > 0 ? 'arrow-up' : 'arrow-down'
  return (
    <span className="flex items-center gap-xs font-label-sm text-label-sm text-secondary">
      <Icon name={icon} size={16} className={diff === 0 ? '' : 'text-primary'} />
      {diff > 0 ? '+' : ''}
      {diff}
      {suffix}
    </span>
  )
}

export default function BodyMeasurements() {
  const { t } = useTranslation()
  const { unit, weightLabel, lengthLabel, showWeight, showLength, toStoredWeight, toStoredLength } = useUnitFormat()
  const setUnit = useSetUnit()
  const { data: measurements, isPending: loading, error, refetch } = useMeasurements()
  const logMeasurement = useLogMeasurement()

  // The weight ceiling depends on the unit the numbers are typed in.
  const schema = useMemo(() => measurementSchema(unit), [unit])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeasurementInput, unknown, MeasurementValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: emptyForm,
  })

  // The API always stores lbs/inches -- convert on the way out so a metric
  // user's "84 kg" isn't written to the database as 84 lbs.
  const onValid = (values: MeasurementValues) =>
    logMeasurement.mutate(
      {
        weight: toStoredWeight(values.weight),
        bodyFat: values.bodyFat,
        waist: toStoredLength(values.waist),
        chest: toStoredLength(values.chest),
        arms: toStoredLength(values.arms),
      },
      { onSuccess: () => reset(emptyForm) },
    )

  if (loading) return <Spinner label={t('bodyMeasurements.loadingMeasurements')} />
  if (error) return <ErrorState error={error} onRetry={refetch} />

  const chartData = [...(measurements ?? [])]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, weight: showWeight(m.weight), bodyFat: m.bodyFat }))

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="flex flex-wrap items-center justify-between gap-md mb-lg">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          {t('bodyMeasurements.bodyMeasurements')}
        </h1>
        <UnitToggle unit={unit} onChange={setUnit} imperialLabel={t('bodyMeasurements.lbsIn')} metricLabel={t('common.kgCm')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Log form */}
        <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-md">{t('bodyMeasurements.logMeasurements')}</h2>
          <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-md">
            {fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="font-label-bold text-label-bold text-on-surface-variant mb-xs flex items-center gap-xs"
                >
                  <Icon name={field.icon} size={16} />
                  {t(field.label)}
                  {field.kind === 'weight' ? ` (${weightLabel})` : null}
                  {field.kind === 'length' ? ` (${lengthLabel})` : null}
                </label>
                <input
                  id={field.name}
                  type="number"
                  step={field.step}
                  min="0"
                  inputMode="decimal"
                  aria-invalid={errors[field.name] ? 'true' : undefined}
                  aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                  {...register(field.name)}
                  placeholder="—"
                  className={`w-full bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset outline-none transition-all font-body-md text-on-surface focus:ring-2 focus:bg-surface-container-lowest ${
                    errors[field.name] ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'
                  }`}
                />
                {errors[field.name] ? (
                  <p id={`${field.name}-error`} className="font-label-sm text-label-sm text-error mt-xs">{errors[field.name]?.message}</p>
                ) : null}
              </div>
            ))}

            <button
              type="submit"
              disabled={logMeasurement.isPending}
              className="disabled:opacity-60 w-full bg-primary-container text-on-primary font-label-bold text-label-bold py-sm rounded-lg hover:bg-primary transition-colors active:scale-[0.98]"
            >
              {logMeasurement.isPending ? t('common.saving') : t('bodyMeasurements.saveEntry')}
            </button>
          </form>
        </section>

        {/* Trend + history */}
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant min-h-[320px] flex flex-col">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface">{t('bodyMeasurements.weightBodyFatTrend')}</h2>
              <div className="flex items-center gap-md font-label-sm text-label-sm text-secondary">
                <span className="flex items-center gap-xs">
                  <span className="w-3 h-1 rounded-full bg-primary-container" />{' '}{t('bodyMeasurements.weight')}
                </span>
                <span className="flex items-center gap-xs">
                  <span className="w-3 h-1 rounded-full bg-secondary" />{' '}{t('bodyMeasurements.bodyFat2')}
                </span>
              </div>
            </div>
            <div className="flex-grow min-h-[240px]">
              <MeasurementChart data={chartData} showBodyFat />
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant overflow-hidden">
            <h2 className="font-headline-md text-headline-md text-on-surface p-lg pb-md">{t('bodyMeasurements.recentHistory')}</h2>
            <ul className="divide-y divide-surface-variant">
              {(measurements ?? []).slice(0, 8).map((entry, index, list) => {
                const previous = list[index + 1]
                return (
                  <li key={entry.id} className="p-md flex flex-wrap items-center justify-between gap-md">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 rounded-lg bg-surface-container flex flex-col items-center justify-center shrink-0">
                        <span className="font-label-sm text-[10px] text-secondary uppercase leading-none">
                          {new Date(entry.date).toLocaleDateString(i18n.language, { month: 'short' })}
                        </span>
                        <span className="font-label-bold text-label-bold text-on-surface leading-none">
                          {new Date(entry.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <span className="block font-label-bold text-label-bold text-on-surface">
                          {showWeight(entry.weight)} {weightLabel}
                        </span>
                        <span className="block font-label-sm text-label-sm text-secondary">
                          {entry.bodyFat != null ? `${entry.bodyFat}% BF` : t('bodyMeasurements.bodyFatNotLogged')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-lg">
                      <div>
                        <span className="block font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                          {t('bodyMeasurements.weight')}
                        </span>
                        <Delta current={showWeight(entry.weight)} previous={showWeight(previous?.weight)} />
                      </div>
                      <div>
                        <span className="block font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                          {t('bodyMeasurements.chest')}
                        </span>
                        <Delta current={showLength(entry.chest)} previous={showLength(previous?.chest)} />
                      </div>
                      <div>
                        <span className="block font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                          {t('bodyMeasurements.waist')}
                        </span>
                        <Delta current={showLength(entry.waist)} previous={showLength(previous?.waist)} />
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
