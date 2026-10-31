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
  { value: 'sedentary', label: 'Sedentary (Office job, little to no exercise)' },
  { value: 'light', label: 'Light (Exercise 1-3 times/week)' },
  { value: 'moderate', label: 'Moderate (Exercise 4-5 times/week)' },
  { value: 'heavy', label: 'Heavy (Intense exercise 6-7 times/week)' },
  { value: 'athlete', label: 'Athlete (Very intense exercise daily, physical job)' },
]

export default function TdeeCalculator() {
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
        title="TDEE Calculator"
        description="Total Daily Energy Expenditure — the calories you burn on an average day."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <div className="flex flex-wrap items-center justify-between gap-sm mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
              <Icon name="sliders-horizontal" size={20} className="text-primary" />
              Your details
            </h2>
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>

          <div className="space-y-md">
            <SexToggle value={sex} onChange={setSex} />
            <div className="grid grid-cols-2 gap-md">
              <NumberInput id="age" label="Age" value={age} onChange={setAge} error={errors.age} />
              <NumberInput id="weight" label={`Weight (${weightLabel})`} value={weight} onChange={setWeight} error={errors.weight} />
            </div>
            <HeightInput value={height} onChange={setHeight} errors={errors} />
            <div>
              <label htmlFor="activity" className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
                Activity Level
              </label>
              <div className="relative">
                <select
                  id="activity"
                  value={activity}
                  onChange={(event) => setActivity(event.target.value as ActivityLevel | '')}
                  className={`${inputClass} appearance-none pr-xl ${errors.activity ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'}`}
                >
                  <option value="">Choose your activity level</option>
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
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
              Your Daily Calorie Needs
            </span>
            <p className="font-display-stat text-display-stat text-primary mt-sm">{result ? result.tdee.toLocaleString() : '—'}</p>
            <p className="font-label-sm text-label-sm text-on-primary-fixed-variant">kcal / day</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant space-y-md">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-secondary flex items-center gap-xs">
                <Icon name="chart-pie" size={18} />
                Basal Metabolic Rate (BMR)
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">{result ? `${result.bmr.toLocaleString()} kcal` : '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-secondary flex items-center gap-xs">
                <Icon name="footprints" size={18} />
                Activity Calories
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">
                {result ? `${result.activity_calories.toLocaleString()} kcal` : '—'}
              </span>
            </div>
            <div className="border-t border-surface-variant pt-md grid grid-cols-2 gap-md">
              <div className="text-center">
                <span className="block font-headline-md text-headline-md text-on-surface">{result ? result.cut.toLocaleString() : '—'}</span>
                <span className="font-label-sm text-label-sm text-secondary">Cut (−1 lb/wk)</span>
              </div>
              <div className="text-center">
                <span className="block font-headline-md text-headline-md text-on-surface">{result ? result.lean_bulk.toLocaleString() : '—'}</span>
                <span className="font-label-sm text-label-sm text-secondary">Lean bulk</span>
              </div>
            </div>
          </div>

          <div className="bg-secondary-container rounded-xl p-lg flex gap-md">
            <Icon name="lightbulb" size={22} className="text-on-secondary-container shrink-0" />
            <p className="font-body-md text-body-md text-on-secondary-container text-sm">
              <span className="font-semibold">Pro Tip:</span> treat this number as a starting point. Track your weight
              for two weeks and adjust by 100-200 kcal if the trend is not moving the way you want.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
