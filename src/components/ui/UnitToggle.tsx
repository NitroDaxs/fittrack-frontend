import { useTranslation } from 'react-i18next'
import type { Units } from '../../types/shared'

interface UnitToggleProps {
  unit: Units
  onChange: (unit: Units) => void
  imperialLabel?: string
  metricLabel?: string
}

const options = (imperialLabel: string, metricLabel: string): { value: Units; label: string }[] => [
  { value: 'imperial', label: imperialLabel },
  { value: 'metric', label: metricLabel },
]

/** Segmented Imperial/Metric switch shared by the calculators. */
export default function UnitToggle({ unit, onChange, imperialLabel, metricLabel }: UnitToggleProps) {
  const { t } = useTranslation()
  return (
    <div className="inline-flex rounded-lg border border-surface-variant overflow-hidden" role="group" aria-label={t('common.units')}>
      {options(imperialLabel ?? t('ui.lbsFtIn'), metricLabel ?? t('common.kgCm')).map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={unit === option.value}
          onClick={() => onChange(option.value)}
          className={`px-md py-xs font-label-sm text-label-sm transition-colors ${
            unit === option.value
              ? 'bg-primary-container text-on-primary'
              : 'bg-surface text-secondary hover:bg-surface-container'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
