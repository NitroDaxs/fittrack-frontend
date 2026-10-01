import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useUnits } from '../context/UnitContext'
import { cmToIn, inToCm, kgToLbs, lbsToKg } from '../utils/units'

const categories = [
  { max: 18.5, label: 'Underweight', tone: 'text-secondary' },
  { max: 25, label: 'Normal weight', tone: 'text-primary' },
  { max: 30, label: 'Overweight', tone: 'text-tertiary' },
  { max: Infinity, label: 'Obese', tone: 'text-error' },
]

const categoryFor = (bmi) => categories.find((c) => bmi < c.max)

export default function BmiCalculator() {
  // Unit is app-wide now, so the seeded defaults have to match whatever the
  // user last chose -- otherwise metric users land on a 185 kg starting weight.
  const { unit, setUnit } = useUnits()
  const [heightFeet, setHeightFeet] = useState('5')
  const [heightInches, setHeightInches] = useState('10')
  const [heightCm, setHeightCm] = useState('178')
  const [weight, setWeight] = useState(() => (unit === 'metric' ? lbsToKg(185).toFixed(1) : '185'))

  const changeUnit = (nextUnit) => {
    if (nextUnit === unit) return
    if (nextUnit === 'metric') {
      const totalIn = (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)
      setHeightCm(inToCm(totalIn).toFixed(1))
      setWeight(lbsToKg(Number(weight) || 0).toFixed(1))
    } else {
      const totalIn = cmToIn(Number(heightCm) || 0)
      setHeightFeet(String(Math.floor(totalIn / 12)))
      setHeightInches((totalIn % 12).toFixed(1))
      setWeight(kgToLbs(Number(weight) || 0).toFixed(1))
    }
    setUnit(nextUnit)
  }

  const heightIn =
    unit === 'imperial' ? (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0) : cmToIn(Number(heightCm) || 0)
  const weightLbs = unit === 'imperial' ? Number(weight) || 0 : kgToLbs(Number(weight) || 0)
  const valid = heightIn > 0 && weightLbs > 0

  // BMI = kg / m^2
  const bmi = valid ? (lbsToKg(weightLbs)) / (heightIn * 0.0254) ** 2 : 0
  const category = valid ? categoryFor(bmi) : null

  const inputClass =
    'w-full bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-body-md text-on-surface transition-all'

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <Link
        to="/calculators"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow_back" size={20} />
        Calculators
      </Link>

      <header className="mb-xl flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
            BMI Calculator
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            A rough population-level screen for body composition based on height and weight.
          </p>
        </div>
        <UnitToggle unit={unit} onChange={changeUnit} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <span className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">Height</span>
          {unit === 'imperial' ? (
            <div className="grid grid-cols-2 gap-md">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={heightFeet}
                  onChange={(event) => setHeightFeet(event.target.value)}
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
                  value={heightInches}
                  onChange={(event) => setHeightInches(event.target.value)}
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
                value={heightCm}
                onChange={(event) => setHeightCm(event.target.value)}
                aria-label="Height in centimeters"
                className={inputClass}
              />
              <span className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-secondary pointer-events-none">
                cm
              </span>
            </div>
          )}
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <label htmlFor="weight" className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">
            Weight ({unit === 'imperial' ? 'lbs' : 'kg'})
          </label>
          <input
            id="weight"
            type="number"
            min="0"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <section className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
        <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">
          Your BMI
        </span>
        <p className="font-display-stat text-display-stat text-primary mt-sm">
          {valid ? bmi.toFixed(1) : '—'}
        </p>
        {category ? (
          <p className={`font-label-bold text-label-bold mt-sm ${category.tone}`}>{category.label}</p>
        ) : null}
      </section>

      <p className="font-label-sm text-label-sm text-secondary mt-lg text-center max-w-xl mx-auto">
        BMI doesn't distinguish muscle from fat, so it can misclassify muscular or very lean people. Treat it as a
        starting point, not a diagnosis.
      </p>
    </div>
  )
}
