import type { IconName } from './Icon'
import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import Icon from './Icon'

interface FieldProps {
  label?: string
  error?: string
}

interface TextFieldProps extends FieldProps, InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName
  hint?: string
}

interface SelectFieldProps extends FieldProps, SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

type TextAreaFieldProps = FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>

const base =
  'block w-full rounded-lg border-0 py-sm px-sm text-on-surface ring-1 ring-inset bg-surface-container-low focus:ring-2 focus:ring-inset focus:bg-surface-container-lowest transition-all duration-200 font-body-md text-body-md placeholder:text-secondary-fixed-dim outline-none'

// The fields forward their ref so react-hook-form's `register` can attach to them.

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, error, hint, id, className = '', ...props },
  ref,
) {
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
          ref={ref}
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
          <Icon name="circle-alert" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="font-label-sm text-label-sm text-secondary mt-xs">
          {hint}
        </p>
      ) : null}
    </div>
  )
})

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, id, children, className = '', ...props },
  ref,
) {
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
          ref={ref}
          id={fieldId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className={`${base} appearance-none pr-xl ${
            error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'
          }`}
          {...props}
        >
          {children}
        </select>
        <Icon
          name="chevron-down"
          size={20}
          className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
        />
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
          <Icon name="circle-alert" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  )
})

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, error, id, className = '', ...props },
  ref,
) {
  const fieldId = id ?? props.name
  return (
    <div className={className}>
      {label ? (
        <label className="block font-label-bold text-label-bold text-on-surface mb-xs" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        rows={3}
        className={`${base} ${error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'}`}
        {...props}
      />
      {error ? (
        <p id={`${fieldId}-error`} className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
          <Icon name="circle-alert" size={14} />
          {error}
        </p>
      ) : null}
    </div>
  )
})
