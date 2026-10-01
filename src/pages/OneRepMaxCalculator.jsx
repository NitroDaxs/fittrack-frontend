import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import UnitToggle from '../components/ui/UnitToggle'
import { useUnits } from '../context/UnitContext'
import { kgToLbs, lbsToKg } from '../utils/units'

// Epley: 1RM = w * (1 + r/30). Exact at one rep, and the standard choice for
// the 2-10 rep range most people test in.
const epley = (weight, reps) => (reps <= 1 ? weight : weight * (1 + reps / 30))

const percentages = [
  { pct: 100, label: '1 rep' },
  { pct: 95, label: '2 reps' },
  { pct: 90, label: '4 reps' },
  { pct: 85, label: '6 reps' },
  { pct: 80, label: '8 reps' },
  { pct: 75, label: '10 reps' },
  { pct: 70, label: '12 reps' },
]

export default function OneRepMaxCalculator() {
  const { unit, setUnit } = useUnits()
  const [weight, setWeight] = useState(() => (unit === 'metric' ? lbsToKg(100).toFixed(1) : '100'))
  const [reps, setReps] = useState('5')

  const changeUnit = (nextUnit) => {
    if (nextUnit === unit) return
    setWeight((nextUnit === 'metric' ? lbsToKg(Number(weight) || 0) : kgToLbs(Number(weight) || 0)).toFixed(1))
    setUnit(nextUnit)
  }

  const w = Number(weight) || 0
  const r = Math.min(Math.max(Number(reps) || 0, 0), 20)
  const oneRm = w > 0 && r > 0 ? Math.round(epley(w, r)) : 0

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
            1RM Calculator
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Estimate your one-rep max to optimize your training zones.
          </p>
        </div>
        <UnitToggle unit={unit} onChange={changeUnit} imperialLabel="lbs" metricLabel="kg" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <label htmlFor="weight" className="font-label-bold text-label-bold text-on-surface-variant mb-sm flex items-center gap-xs">
            <Icon name="fitness_center" size={18} />
            Weight Lifted ({unit === 'imperial' ? 'lbs' : 'kg'})
          </label>
          <input
            id="weight"
            type="number"
            min="0"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            className="w-full bg-surface-container-low rounded-lg py-md px-md ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-headline-md text-headline-md text-on-surface transition-all"
          />
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <label htmlFor="reps" className="font-label-bold text-label-bold text-on-surface-variant mb-sm flex items-center gap-xs">
            <Icon name="repeat" size={18} />
            Reps Performed
          </label>
          <input
            id="reps"
            type="number"
            min="1"
            max="20"
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            className="w-full bg-surface-container-low rounded-lg py-md px-md ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-headline-md text-headline-md text-on-surface transition-all"
          />
          {r > 12 ? (
            <p className="font-label-sm text-label-sm text-secondary mt-sm">
              Above about 12 reps the estimate drifts — test closer to a heavy triple for accuracy.
            </p>
          ) : null}
        </div>
      </div>

      <section className="bg-primary-fixed rounded-xl p-xl text-center mb-xl border border-outline-variant">
        <span className="font-label-bold text-label-bold text-on-primary-fixed-variant uppercase tracking-widest">
          Estimated 1-Rep Max
        </span>
        <p className="font-display-stat text-display-stat text-primary mt-sm">
          {oneRm || '—'} {oneRm ? (unit === 'imperial' ? 'lbs' : 'kg') : ''}
        </p>
        <p className="font-label-sm text-label-sm text-on-primary-fixed-variant mt-sm flex items-center justify-center gap-xs">
          <Icon name="info" size={16} />
          Epley Formula
        </p>
      </section>

      {oneRm > 0 ? (
        <section className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant overflow-hidden">
          <h2 className="font-headline-md text-headline-md text-on-surface p-lg pb-md">Training percentages</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low border-y border-surface-variant">
                <th className="py-sm px-lg font-label-bold text-label-bold text-on-surface-variant">% of 1RM</th>
                <th className="py-sm px-lg font-label-bold text-label-bold text-on-surface-variant">Load</th>
                <th className="py-sm px-lg font-label-bold text-label-bold text-on-surface-variant text-right">
                  Typical reps
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {percentages.map((row) => (
                <tr key={row.pct} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-sm px-lg font-body-md text-body-md text-secondary">{row.pct}%</td>
                  <td className="py-sm px-lg font-label-bold text-label-bold text-on-surface">
                    {Math.round((oneRm * row.pct) / 100)}
                  </td>
                  <td className="py-sm px-lg font-body-md text-body-md text-secondary text-right">{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  )
}
