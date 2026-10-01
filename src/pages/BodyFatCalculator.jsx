import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useUnits } from '../context/UnitContext'
import { cmToIn, inToCm } from '../utils/units'

// US Navy tape-measurement method. Inputs in inches.
function bodyFatPercent({ sex, heightIn, neckIn, waistIn, hipIn }) {
  if (sex === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waistIn - neckIn) + 0.15456 * Math.log10(heightIn)) - 450
  }
  return (
    495 / (1.29579 - 0.35004 * Math.log10(waistIn + hipIn - neckIn) + 0.221 * Math.log10(heightIn)) - 450
  )
}

const categories = {
  male: [
    { max: 6, label: 'Essential fat' },
    { max: 14, label: 'Athletic' },
    { max: 18, label: 'Fitness' },
    { max: 25, label: 'Average' },
    { max: Infinity, label: 'Above average' },
  ],
  female: [
    { max: 14, label: 'Essential fat' },
    { max: 21, label: 'Athletic' },
    { max: 25, label: 'Fitness' },
    { max: 32, label: 'Average' },
    { max: Infinity, label: 'Above average' },
  ],
}

export default function BodyFatCalculator() {
  const { unit, setUnit } = useUnits()
  const [sex, setSex] = useState('male')
  const [heightFeet, setHeightFeet] = useState('5')
  const [heightInches, setHeightInches] = useState('10')
  const [heightCm, setHeightCm] = useState('178')
  const startLength = (inches) => (unit === 'metric' ? inToCm(inches).toFixed(1) : String(inches))
  const [neck, setNeck] = useState(() => startLength(15))
  const [waist, setWaist] = useState(() => startLength(34))
  const [hip, setHip] = useState(() => startLength(38))

  const changeUnit = (nextUnit) => {
    if (nextUnit === unit) return
    if (nextUnit === 'metric') {
      const totalIn = (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0)
      setHeightCm(inToCm(totalIn).toFixed(1))
      setNeck(inToCm(Number(neck) || 0).toFixed(1))
      setWaist(inToCm(Number(waist) || 0).toFixed(1))
      setHip(inToCm(Number(hip) || 0).toFixed(1))
    } else {
      const totalIn = cmToIn(Number(heightCm) || 0)
      setHeightFeet(String(Math.floor(totalIn / 12)))
      setHeightInches((totalIn % 12).toFixed(1))
      setNeck(cmToIn(Number(neck) || 0).toFixed(1))
      setWaist(cmToIn(Number(waist) || 0).toFixed(1))
      setHip(cmToIn(Number(hip) || 0).toFixed(1))
    }
    setUnit(nextUnit)
  }

  const heightIn =
    unit === 'imperial' ? (Number(heightFeet) || 0) * 12 + (Number(heightInches) || 0) : cmToIn(Number(heightCm) || 0)
  const toIn = (value) => (unit === 'imperial' ? Number(value) || 0 : cmToIn(Number(value) || 0))
  const neckIn = toIn(neck)
  const waistIn = toIn(waist)
  const hipIn = toIn(hip)

  const valid = heightIn > 0 && neckIn > 0 && waistIn > neckIn && (sex === 'male' || hipIn > 0)

  const bodyFat = valid ? bodyFatPercent({ sex, heightIn, neckIn, waistIn, hipIn }) : 0
  const category = valid ? categories[sex].find((c) => bodyFat < c.max) : null

  const lengthUnitLabel = unit === 'imperial' ? 'in' : 'cm'
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
            Body Fat % Estimator
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Estimate body fat with the US Navy tape-measurement method.
          </p>
        </div>
        <UnitToggle unit={unit} onChange={changeUnit} imperialLabel="ft-in" metricLabel="cm" />
      </header>

      <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-lg">
        <span className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">Sex</span>
        <div className="flex rounded-lg border border-surface-variant overflow-hidden">
          {['male', 'female'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSex(option)}
              className={`flex-1 py-sm font-label-bold text-label-bold capitalize transition-colors ${
                sex === option ? 'bg-primary-container text-on-primary' : 'bg-surface text-secondary hover:bg-surface-container'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

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
          <label htmlFor="neck" className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">
            Neck ({lengthUnitLabel})
          </label>
          <input id="neck" type="number" min="0" value={neck} onChange={(event) => setNeck(event.target.value)} className={inputClass} />
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <label htmlFor="waist" className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">
            Waist ({lengthUnitLabel}), at the navel
          </label>
          <input
            id="waist"
            type="number"
            min="0"
            value={waist}
            onChange={(event) => setWaist(event.target.value)}
            className={inputClass}
          />
        </div>

        {sex === 'female' ? (
          <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
            <label htmlFor="hip" className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">
              Hip ({lengthUnitLabel}), at the widest point
            </label>
            <input id="hip" type="number" min="0" value={hip} onChange={(event) => setHip(event.target.value)} className={inputClass} />
          </div>
        ) : null}
      </div>

      <section className="bg-primary-fixed rounded-xl p-xl text-center border border-outline-variant">
        <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">
          Estimated Body Fat
        </span>
        <p className="font-display-stat text-display-stat text-primary mt-sm">
          {valid ? `${bodyFat.toFixed(1)}%` : '—'}
        </p>
        {category ? (
          <p className="font-label-bold text-label-bold text-on-primary-fixed-variant mt-sm">{category.label}</p>
        ) : (
          <p className="font-label-sm text-label-sm text-on-primary-fixed-variant mt-sm">
            Waist must be larger than neck to compute a result.
          </p>
        )}
      </section>

      <p className="font-label-sm text-label-sm text-secondary mt-lg text-center max-w-xl mx-auto">
        Tape measurements are a rough estimate — accuracy depends on consistent, taut (not tight) placement. For a
        precise reading, use DEXA or hydrostatic weighing.
      </p>
    </div>
  )
}
