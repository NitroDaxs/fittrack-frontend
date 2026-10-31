import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CalculateButton, CalculatorHeader, FieldError, FormError, NumberInput, toNumber } from '../components/calculators/shared'
import { useMacros } from '../hooks/useCalculators'
import type { MacroResult, MacroSplit } from '../types/calculators'
import { fieldErrorsOf } from '../services/http'

const splits: { value: MacroSplit; label: string }[] = [
  { value: 'balanced', label: 'calculators.macro.balanced' },
  { value: 'high_protein', label: 'calculators.macro.highProtein' },
  { value: 'low_carb', label: 'calculators.macro.lowCarb' },
  { value: 'keto', label: 'calculators.macro.keto' },
]

const macroStyle: Record<MacroResult['targets'][number]['macro'], { label: string; tone: string; text: string }> = {
  protein: { label: 'calculators.macro.protein', tone: 'bg-primary', text: 'text-primary' },
  carbs: { label: 'calculators.macro.carbs', tone: 'bg-secondary', text: 'text-secondary' },
  fat: { label: 'calculators.macro.fat', tone: 'bg-tertiary', text: 'text-tertiary' },
}

export default function MacroCalculator() {
  const { t } = useTranslation()
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
      <CalculatorHeader title={t('common.macroSplitCalculator')} description={t('calculators.macro.divideADailyCalorieTargetInto')} />

      <form onSubmit={submit} noValidate className="bg-surface-container-lowest rounded-xl p-lg elev-card border border-surface-variant mb-xl space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div>
            <NumberInput id="calories" label={t('calculators.macro.dailyCalories')} value={calories} onChange={setCalories} error={errors.calories} />
            <p className="font-label-sm text-label-sm text-secondary mt-sm">
              {t('calculators.macro.notSureUseThe')}{' '}
              <Link to="/calculators/tdee" className="text-primary hover:text-primary-container">
                {t('calculators.macro.tdeeCalculator')}
              </Link>{' '}
              {t('calculators.macro.first')}
            </p>
          </div>
          <div>
            <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">{t('calculators.macro.split')}</span>
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
                  {t(option.label)}
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
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('calculators.macro.dailyTargets')}</h2>
            <span className="font-label-sm text-label-sm text-secondary">{t('calculators.macro.kcal', { calories: result.calories.toLocaleString(i18n.language) })}</span>
          </div>

          <div className="flex h-3 mx-lg rounded-full overflow-hidden bg-surface-container">
            {result.targets.map((target) => (
              <div
                key={target.macro}
                className={macroStyle[target.macro].tone}
                style={{ width: `${target.percent}%` }}
                title={t(macroStyle[target.macro].label)}
              />
            ))}
          </div>

          <div className="divide-y divide-surface-variant mt-lg">
            {result.targets.map((target) => (
              <div key={target.macro} className="flex items-center justify-between p-lg">
                <span className={`font-label-bold text-label-bold flex items-center gap-sm ${macroStyle[target.macro].text}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${macroStyle[target.macro].tone}`} />
                  {t(macroStyle[target.macro].label)}
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
