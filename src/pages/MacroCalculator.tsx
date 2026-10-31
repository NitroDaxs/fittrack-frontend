import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalculateButton, CalculatorHeader, FieldError, FormError, NumberInput, toNumber } from '../components/calculators/shared'
import { useMacros } from '../hooks/useCalculators'
import type { MacroResult, MacroSplit } from '../types/calculators'
import { fieldErrorsOf } from '../services/http'

const splits: { value: MacroSplit; label: string }[] = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'high_protein', label: 'High Protein' },
  { value: 'low_carb', label: 'Low Carb' },
  { value: 'keto', label: 'Keto' },
]

const macroStyle: Record<MacroResult['targets'][number]['macro'], { label: string; tone: string; text: string }> = {
  protein: { label: 'Protein', tone: 'bg-primary', text: 'text-primary' },
  carbs: { label: 'Carbs', tone: 'bg-secondary', text: 'text-secondary' },
  fat: { label: 'Fat', tone: 'bg-tertiary', text: 'text-tertiary' },
}

export default function MacroCalculator() {
  const [calories, setCalories] = useState('')
  const [split, setSplit] = useState<MacroSplit | null>(null)
  const calculation = useMacros()

  const errors = fieldErrorsOf(calculation.error)
  const result = calculation.data

  const submit = (event: FormEvent) => {
    event.preventDefault()
    calculation.mutate({ calories: toNumber(calories), split })
  }

  return (
    <div className="max-w-[800px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <CalculatorHeader title="Macro Split Calculator" description="Divide a daily calorie target into protein, carbs, and fat." />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div>
            <NumberInput id="calories" label="Daily Calories" value={calories} onChange={setCalories} error={errors.calories} />
            <p className="font-label-sm text-label-sm text-secondary mt-sm">
              Not sure? Use the{' '}
              <Link to="/calculators/tdee" className="text-primary hover:text-primary-container">
                TDEE calculator
              </Link>{' '}
              first.
            </p>
          </div>
          <div>
            <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">Split</span>
            <div className="grid grid-cols-2 gap-sm">
              {splits.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={split === option.value}
                  onClick={() => setSplit(option.value)}
                  className={`px-sm py-sm rounded-lg border font-label-sm text-label-sm transition-colors ${
                    split === option.value
                      ? 'border-primary bg-primary-container/10 text-primary'
                      : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <FieldError message={errors.split} />
          </div>
        </div>
        <CalculateButton pending={calculation.isPending} />
        <FormError error={calculation.error} />
      </form>

      {result ? (
        <section className="bg-surface-container-lowest rounded-xl elev-card border border-surface-variant overflow-hidden">
          <div className="p-lg pb-md flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface">Daily targets</h2>
            <span className="font-label-sm text-label-sm text-secondary">{result.calories.toLocaleString()} kcal</span>
          </div>

          <div className="flex h-3 mx-lg rounded-full overflow-hidden bg-surface-container">
            {result.targets.map((target) => (
              <div
                key={target.macro}
                className={macroStyle[target.macro].tone}
                style={{ width: `${target.percent}%` }}
                title={macroStyle[target.macro].label}
              />
            ))}
          </div>

          <div className="divide-y divide-surface-variant mt-lg">
            {result.targets.map((target) => (
              <div key={target.macro} className="flex items-center justify-between p-lg">
                <span className={`font-label-bold text-label-bold flex items-center gap-sm ${macroStyle[target.macro].text}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${macroStyle[target.macro].tone}`} />
                  {macroStyle[target.macro].label}
                </span>
                <span className="font-body-md text-body-md text-secondary">{target.percent}%</span>
                <span className="font-headline-md text-headline-md text-on-surface">{target.grams}g</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
