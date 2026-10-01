import Icon from './Icon'

const base =
  'block w-full rounded-lg border-0 py-sm px-sm text-on-surface ring-1 ring-inset bg-surface-container-low focus:ring-2 focus:ring-inset focus:bg-surface-container-lowest transition-all duration-200 font-body-md text-body-md placeholder:text-secondary-fixed-dim outline-none'

export function TextField({ label, icon, error, hint, id, className = '', ...props }) {
  const fieldId = id ?? props.name
  return (
    <div className={className}>
      {label ? (
        <label className="block font-label-bold text-label-bold text-on-surface mb-xs" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <Icon
            name={icon}
            size={20}
            className="absolute inset-y-0 left-0 flex items-center pl-sm text-secondary pointer-events-none h-full"
          />
        ) : null}
        <input
          id={fieldId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={`${base} ${icon ? 'pl-[36px]' : ''} ${
            error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'
          }`}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
          <Icon name="error" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="font-label-sm text-label-sm text-secondary mt-xs">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function SelectField({ label, error, id, children, className = '', ...props }) {
  const fieldId = id ?? props.name
  return (
    <div className={className}>
      {label ? (
        <label className="block font-label-bold text-label-bold text-on-surface mb-xs" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={fieldId}
          className={`${base} appearance-none pr-xl ${
            error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'
          }`}
          {...props}
        >
          {children}
        </select>
        <Icon
          name="expand_more"
          size={20}
          className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
        />
      </div>
      {error ? (
        <p className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
          <Icon name="error" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextAreaField({ label, error, id, className = '', ...props }) {
  const fieldId = id ?? props.name
  return (
    <div className={className}>
      {label ? (
        <label className="block font-label-bold text-label-bold text-on-surface mb-xs" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <textarea
        id={fieldId}
        rows={3}
        className={`${base} ${error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'}`}
        {...props}
      />
      {error ? (
        <p className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
          <Icon name="error" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  )
}
