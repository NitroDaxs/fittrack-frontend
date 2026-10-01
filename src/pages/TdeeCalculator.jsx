import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useUnits } from '../context/UnitContext'
import { cmToIn, inToCm, kgToLbs, lbsToKg } from '../utils/units'

const activityLevels = [
  { value: 1.2, label: 'Sedentary (Office job, little to no exercise)' },
  { value: 1.375, label: 'Light (Exercise 1-3 times/week)' },
  { value: 1.55, label: 'Moderate (Exercise 4-5 times/week)' },
  { value: 1.725, label: 'Heavy (Intense exercise 6-7 times/week)' },
  { value: 1.9, label: 'Athlete (Very intense exercise daily, physical job)' },
]

// Mifflin-St Jeor, the current standard for BMR estimation.
function bmrFor({ sex, age, weightLbs, heightIn }) {
  const kg = weightLbs * 0.453592
  const cm = heightIn * 2.54
  const base = 10 * kg + 6.25 * cm - 5 * age
  return sex === 'male' ? base + 5 : base - 161
}

export default function TdeeCalculator() {
  const { unit, setUnit } = useUnits()
  const [form, setForm] = useState(() => ({
    sex: 'male',
    age: '30',
    weight: unit === 'metric' ? lbsToKg(185).toFixed(1) : '185',
    heightFeet: '5',
    heightInches: '10',
    heightCm: '178',
    activity: 1.55,
  }))

  const setField = (name) => (event) =>
    setForm((f) => ({ ...f, [name]: name === 'activity' ? Number(event.target.value) : event.target.value }))

  const changeUnit = (nextUnit) => {
    if (nextUnit === unit) return
    setForm((f) => {
      if (nextUnit === 'metric') {
        const totalIn = (Number(f.heightFeet) || 0) * 12 + (Number(f.heightInches) || 0)
        return { ...f, heightCm: inToCm(totalIn).toFixed(1), weight: lbsToKg(Number(f.weight) || 0).toFixed(1) }
      }
      const totalIn = cmToIn(Number(f.heightCm) || 0)
      return {
        ...f,
        heightFeet: String(Math.floor(totalIn / 12)),
        heightInches: (totalIn % 12).toFixed(1),
        weight: kgToLbs(Number(f.weight) || 0).toFixed(1),
      }
    })
    setUnit(nextUnit)
  }

  const heightIn =
    unit === 'imperial'
      ? (Number(form.heightFeet) || 0) * 12 + (Number(form.heightInches) || 0)
      : cmToIn(Number(form.heightCm) || 0)
  const weightLbs = unit === 'imperial' ? Number(form.weight) || 0 : kgToLbs(Number(form.weight) || 0)
  const valid = Number(form.age) > 0 && weightLbs > 0 && heightIn > 0

  const bmr = valid
    ? Math.round(bmrFor({ sex: form.sex, age: Number(form.age), weightLbs, heightIn }))
    : 0
  const tdee = valid ? Math.round(bmr * form.activity) : 0
  const activityCalories = tdee - bmr

  const inputClass =
    'w-full bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-body-md text-on-surface transition-all'

  return (
    <div className="max-w-[900px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <Link
        to="/calculators"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow_back" size={20} />
        Calculators
      </Link>

      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          TDEE Calculator
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Total Daily Energy Expenditure — the calories you burn on an average day.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <section className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <div className="flex flex-wrap items-center justify-between gap-sm mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
              <Icon name="tune" size={20} className="text-primary" />
              Your details
            </h2>
            <UnitToggle unit={unit} onChange={changeUnit} />
          </div>

          <div className="space-y-md">
            <div>
              <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">Sex</span>
              <div className="flex rounded-lg border border-surface-variant overflow-hidden">
                {['male', 'female'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, sex: option }))}
                    className={`flex-1 py-sm font-label-bold text-label-bold capitalize transition-colors ${
                      form.sex === option
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface text-secondary hover:bg-surface-container'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label htmlFor="age" className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
                  Age
                </label>
                <input id="age" type="number" min="1" value={form.age} onChange={setField('age')} className={inputClass} />
              </div>
              <div>
                <label htmlFor="weight" className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
                  Weight ({unit === 'imperial' ? 'lbs' : 'kg'})
                </label>
                <input
                  id="weight"
                  type="number"
                  min="1"
                  value={form.weight}
                  onChange={setField('weight')}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">Height</span>
              {unit === 'imperial' ? (
                <div className="grid grid-cols-2 gap-md">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={form.heightFeet}
                      onChange={setField('heightFeet')}
                      aria-label="Height in feet"
                      className={inputClass}
                    />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-secondary pointer-events-none">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={form.heightInches}
                      onChange={setField('heightInches')}
                      aria-label="Height in inches"
                      className={inputClass}
                    />
                    <span className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-secondary pointer-events-none">
                      in
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={form.heightCm}
                    onChange={setField('heightCm')}
                    aria-label="Height in centimeters"
                    className={inputClass}
                  />
                  <span className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-secondary pointer-events-none">
                    cm
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="activity" className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
                Activity Level
              </label>
              <div className="relative">
                <select id="activity" value={form.activity} onChange={setField('activity')} className={`${inputClass} appearance-none pr-xl`}>
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <Icon
                  name="expand_more"
                  size={20}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-lg">
          <div className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
            <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest flex items-center justify-center gap-xs">
              <Icon name="bolt" size={18} />
              Your Daily Calorie Needs
            </span>
            <p className="font-display-stat text-display-stat text-primary mt-sm">
              {valid ? tdee.toLocaleString() : '—'}
            </p>
            <p className="font-label-sm text-label-sm text-on-primary-fixed-variant">kcal / day</p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant space-y-md">
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-secondary flex items-center gap-xs">
                <Icon name="pie_chart" size={18} />
                Basal Metabolic Rate (BMR)
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">
                {valid ? `${bmr.toLocaleString()} kcal` : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-body-md text-body-md text-secondary flex items-center gap-xs">
                <Icon name="directions_run" size={18} />
                Activity Calories
              </span>
              <span className="font-label-bold text-label-bold text-on-surface">
                {valid ? `${activityCalories.toLocaleString()} kcal` : '—'}
              </span>
            </div>
            <div className="border-t border-surface-variant pt-md grid grid-cols-2 gap-md">
              <div className="text-center">
                <span className="block font-headline-md text-headline-md text-on-surface">
                  {valid ? (tdee - 500).toLocaleString() : '—'}
                </span>
                <span className="font-label-sm text-label-sm text-secondary">Cut (−1 lb/wk)</span>
              </div>
              <div className="text-center">
                <span className="block font-headline-md text-headline-md text-on-surface">
                  {valid ? (tdee + 300).toLocaleString() : '—'}
                </span>
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
