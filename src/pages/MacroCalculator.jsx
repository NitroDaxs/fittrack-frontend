import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/ui/Icon'

// Grams per macro = (calories * share) / kcal-per-gram, where protein and
// carbs are 4 kcal/g and fat is 9 kcal/g.
const splits = [
  { key: 'balanced', label: 'Balanced', protein: 0.3, carbs: 0.4, fat: 0.3 },
  { key: 'high-protein', label: 'High Protein', protein: 0.4, carbs: 0.3, fat: 0.3 },
  { key: 'low-carb', label: 'Low Carb', protein: 0.4, carbs: 0.2, fat: 0.4 },
  { key: 'keto', label: 'Keto', protein: 0.25, carbs: 0.05, fat: 0.7 },
]

const macroRows = [
  { key: 'protein', label: 'Protein', kcalPerGram: 4, tone: 'bg-primary', text: 'text-primary' },
  { key: 'carbs', label: 'Carbs', kcalPerGram: 4, tone: 'bg-secondary', text: 'text-secondary' },
  { key: 'fat', label: 'Fat', kcalPerGram: 9, tone: 'bg-tertiary', text: 'text-tertiary' },
]

export default function MacroCalculator() {
  const [calories, setCalories] = useState('2400')
  const [splitKey, setSplitKey] = useState('balanced')

  const cals = Number(calories) || 0
  const valid = cals > 0
  const split = splits.find((s) => s.key === splitKey)

  const grams = {
    protein: valid ? Math.round((cals * split.protein) / 4) : 0,
    carbs: valid ? Math.round((cals * split.carbs) / 4) : 0,
    fat: valid ? Math.round((cals * split.fat) / 9) : 0,
  }

  const shareOf = { protein: split.protein, carbs: split.carbs, fat: split.fat }

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

      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Macro Split Calculator
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Divide a daily calorie target into protein, carbs, and fat.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mb-xl">
        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <label htmlFor="calories" className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">
            Daily Calories
          </label>
          <input
            id="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
            className={inputClass}
          />
          <p className="font-label-sm text-label-sm text-secondary mt-sm">
            Not sure? Use the{' '}
            <Link to="/calculators/tdee" className="text-primary hover:text-primary-container">
              TDEE calculator
            </Link>{' '}
            first.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant">
          <span className="font-label-bold text-label-bold text-on-surface-variant mb-sm block">Split</span>
          <div className="grid grid-cols-2 gap-sm">
            {splits.map((option) => (
              <button
                key={option.key}
                type="button"
                aria-pressed={splitKey === option.key}
                onClick={() => setSplitKey(option.key)}
                className={`px-sm py-sm rounded-lg border font-label-sm text-label-sm transition-colors ${
                  splitKey === option.key
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant overflow-hidden">
        <div className="p-lg pb-md flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Daily targets</h2>
          <span className="font-label-sm text-label-sm text-secondary">{valid ? cals.toLocaleString() : '—'} kcal</span>
        </div>

        <div className="flex h-3 mx-lg rounded-full overflow-hidden bg-surface-container">
          {macroRows.map((row) => (
            <div
              key={row.key}
              className={row.tone}
              style={{ width: `${Math.round(shareOf[row.key] * 100)}%` }}
              title={row.label}
            />
          ))}
        </div>

        <div className="divide-y divide-surface-variant mt-lg">
          {macroRows.map((row) => (
            <div key={row.key} className="flex items-center justify-between p-lg">
              <span className={`font-label-bold text-label-bold flex items-center gap-sm ${row.text}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${row.tone}`} />
                {row.label}
              </span>
              <span className="font-body-md text-body-md text-secondary">
                {Math.round(shareOf[row.key] * 100)}%
              </span>
              <span className="font-headline-md text-headline-md text-on-surface">
                {valid ? `${grams[row.key]}g` : '—'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
