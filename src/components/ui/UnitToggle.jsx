/** Segmented Imperial/Metric switch shared by the calculators. */
export default function UnitToggle({ unit, onChange, imperialLabel = 'lbs / ft-in', metricLabel = 'kg / cm' }) {
  return (
    <div className="inline-flex rounded-lg border border-surface-variant overflow-hidden" role="group" aria-label="Units">
      {[
        { value: 'imperial', label: imperialLabel },
        { value: 'metric', label: metricLabel },
      ].map((option) => (
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
