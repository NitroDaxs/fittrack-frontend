import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index'
import { useState, type FormEvent } from 'react'
import {
  CalculateButton,
  CalculatorHeader,
  emptyHeight,
  FieldError,
  FormError,
  heightRequest,
  HeightInput,
  inputClass,
  NumberInput,
  SexToggle,
  toNumber,
  useCalculatorUnit,
} from '../components/calculators/shared'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useTdee } from '../hooks/useCalculators'
import type { ActivityLevel, Sex } from '../types/calculators'
import { fieldErrorsOf } from '../services/http'

const activityLevels: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: 'calculators.tdee.sedentaryOfficeJobLittleToNo' },
  { value: 'light', label: 'calculators.tdee.lightExercise13TimesWeek' },
  { value: 'moderate', label: 'calculators.tdee.moderateExercise45TimesWeek' },
  { value: 'heavy', label: 'calculators.tdee.heavyIntenseExercise67Times' },
  { value: 'athlete', label: 'calculators.tdee.athleteVeryIntenseExerciseDailyPhysical' },
]

export default function TdeeCalculator() {
  const { t } = useTranslation()
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState(emptyHeight)
  const [activity, setActivity] = useState<ActivityLevel | ''>('')
  const calculation = useTdee()
  const { unit, setUnit, weightLabel } = useCalculatorUnit(() => {
    setWeight('')
    setHeight(emptyHeight)
    calculation.reset()
  })

  const errors = fieldErrorsOf(calculation.error)
  const result = calculation.data

  const submit = (event: FormEvent) => {
    event.preventDefault()
    calculation.mutate({
      units: unit,
      sex,
      age: toNumber(age),
      weight: toNumber(weight),
      activity: activity || null,
      ...heightRequest(height),
    })
  }

  return (
    <div className="max-w-[900px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader
        title={t('common.tdeeCalculator')}
        description={t('calculators.tdee.totalDailyEnergyExpenditureTheCalories')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <div className="flex flex-wrap items-center justify-between gap-sm mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
              <Icon name="sliders-horizontal" size={20} className="text-primary" />
              {t('calculators.tdee.yourDetails')}
            </h2>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>

          <div className="space-y-md">
            <SexToggle value={sex} onChange={setSex} />
            <div className="grid grid-cols-2 gap-md">
              <NumberInput id="age" label={t('calculators.tdee.age')} value={age} onChange={setAge} error={errors.age} />
              <NumberInput id="weight" label={t('common.weight', { unit: weightLabel })} value={weight} onChange={setWeight} error={errors.weight} />
            </div>
            <HeightInput value={height} onChange={setHeight} errors={errors} />
            <div>
              <label htmlFor="activity" className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
                {t('calculators.tdee.activityLevel')}
              </label>
              <div className="relative">
                <select
                  id="activity"
                  value={activity}
                  onChange={(event) => setActivity(event.target.value as ActivityLevel | '')}
                  className={`${inputClass} appearance-none pr-xl ${errors.activity ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'}`}
                >
                  <option value="">{t('calculators.tdee.chooseYourActivityLevel')}</option>
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {t(level.label)}
                    </option>
                  ))}
                </select>
                <Icon name="chevron-down" size={20} className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              </div>
              <FieldError message={errors.activity} />
            </div>
            <CalculateButton pending={calculation.isPending} />
            <FormError error={calculation.error} />
          </div>
        </form>

        <section className="flex flex-col gap-lg">
          <div className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
            <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest flex items-center justify-center gap-xs">
              <Icon name="zap" size={18} />
              {t('calculators.tdee.yourDailyCalorieNeeds')}
            </span>
            <p className="font-display-stat text-display-stat text-primary mt-sm">{result ? result.tdee.toLocaleString(i18n.language) : '—'}</p>
            <p className="font-label-sm text-label-sm text-on-primary-fixed-variant">{t('calculators.tdee.kcalDay')}</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant space-y-md">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-secondary flex items-center gap-xs">
                <Icon name="chart-pie" size={18} />
                {t('calculators.tdee.basalMetabolicRateBmr')}
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">{result ? `${result.bmr.toLocaleString(i18n.language)} kcal` : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-secondary flex items-center gap-xs">
                <Icon name="footprints" size={18} />
                {t('calculators.tdee.activityCalories')}
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">
                {result ? `${result.activity_calories.toLocaleString(i18n.language)} kcal` : '—'}
              </span>
            </div>
            <div className="border-t border-surface-variant pt-md grid grid-cols-2 gap-md">
              <div className="text-center">
                <span className="block font-headline-md text-headline-md text-on-surface">{result ? result.cut.toLocaleString(i18n.language) : '—'}</span>
                <span className="font-label-sm text-label-sm text-secondary">{t('calculators.tdee.cut1LbWk')}</span>
              </div>
              <div className="text-center">
                <span className="block font-headline-md text-headline-md text-on-surface">{result ? result.lean_bulk.toLocaleString(i18n.language) : '—'}</span>
                <span className="font-label-sm text-label-sm text-secondary">{t('calculators.tdee.leanBulk')}</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary-container rounded-xl p-lg flex gap-md">
            <Icon name="lightbulb" size={22} className="text-on-secondary-container shrink-0" />
            <p className="font-body-md text-body-md text-on-secondary-container text-sm">
              <span className="font-semibold">{t('calculators.tdee.proTip')}</span>{' '}{t('calculators.tdee.treatThisNumberAsAStarting')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
