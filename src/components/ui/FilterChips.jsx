/**
 * Pill-shaped single-select filter row. `value` of null means "no filter";
 * clicking the active chip clears it.
 */
export default function FilterChips({ label, options, value, onChange, allLabel = 'All' }) {
  return (
    <div>
      <span className="font-label-bold text-label-bold text-on-surface-variant block mb-sm">{label}</span>
      <div className="flex flex-wrap gap-sm">
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-pressed={value === null}
          className={`px-sm py-xs rounded-full border font-label-sm text-label-sm transition-colors ${
            value === null
              ? 'border-primary bg-primary-container/10 text-primary'
              : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
          }`}
        >
          {allLabel}
        </button>
        {options.map((option) => {
          const active = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : option.value)}
              className={`px-sm py-xs rounded-full border font-label-sm text-label-sm transition-colors ${
                active
                  ? 'border-primary bg-primary-container/10 text-primary'
                  : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
