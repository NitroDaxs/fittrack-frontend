import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage, fieldErrorsOf } from '../../services/http'
import type { Sex } from '../../types/calculators'
import type { Units } from '../../types/shared'
import { useUnits } from '../../context/UnitContext'
import Icon from '../ui/Icon'

export const inputClass =
  'w-full bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset outline-none font-body-md text-on-surface transition-all focus:ring-2'

/** A blank input is sent as null, so the API can say what's missing. */
export const toNumber = (value: string): number | null => (value.trim() === '' ? null : Number(value))

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
      <Icon name="circle-alert" size={14} />
      {message}
    </p>
  )
}

interface NumberInputProps {
  id: string
  label?: string
  ariaLabel?: string
  suffix?: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export function NumberInput({ id, label, ariaLabel, suffix, value, onChange, error }: NumberInputProps) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type="number"
          step="any"
          value={value}
          aria-label={ariaLabel}
          aria-invalid={error ? 'true' : undefined}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} ${error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'}`}
        />
        {suffix ? (
          <span className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-secondary pointer-events-none">
            {suffix}
          </span>
        ) : null}
      </div>
      <FieldError message={error} />
    </div>
  )
}

export interface HeightValues {
  feet: string
  inches: string
  cm: string
}

export const emptyHeight: HeightValues = { feet: '', inches: '', cm: '' }

export const heightRequest = (height: HeightValues) => ({
  height_feet: toNumber(height.feet),
  height_inches: toNumber(height.inches),
  height_cm: toNumber(height.cm),
})

export function HeightInput({
  value,
  onChange,
  errors,
}: {
  value: HeightValues
  onChange: (value: HeightValues) => void
  errors: Record<string, string>
}) {
  const { unit } = useUnits()
  return (
    <div>
      <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">Height</span>
      {unit === 'imperial' ? (
        <div className="grid grid-cols-2 gap-md">
          <NumberInput
            id="height-feet"
            ariaLabel="Height in feet"
            suffix="ft"
            value={value.feet}
            onChange={(feet) => onChange({ ...value, feet })}
            error={errors.height_feet}
          />
          <NumberInput
            id="height-inches"
            ariaLabel="Height in inches"
            suffix="in"
            value={value.inches}
            onChange={(inches) => onChange({ ...value, inches })}
            error={errors.height_inches}
          />
        </div>
      ) : (
        <NumberInput
          id="height-cm"
          ariaLabel="Height in centimeters"
          suffix="cm"
          value={value.cm}
          onChange={(cm) => onChange({ ...value, cm })}
          error={errors.height_cm}
        />
      )}
    </div>
  )
}

export function SexToggle({ value, onChange }: { value: Sex; onChange: (value: Sex) => void }) {
  return (
    <div>
      <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">Sex</span>
      <div className="flex rounded-lg border border-surface-variant overflow-hidden">
        {(['male', 'female'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`flex-1 py-sm font-label-bold text-label-bold capitalize transition-colors ${
              value === option ? 'bg-primary-container text-on-primary' : 'bg-surface text-secondary hover:bg-surface-container'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CalculateButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors active:scale-[0.98] disabled:opacity-60"
    >
      <Icon name="calculator" size={20} />
      {pending ? 'Calculating…' : 'Calculate'}
    </button>
  )
}

/** A failure no field can show, such as the server being unreachable. */
export function FormError({ error }: { error: Error | null }) {
  if (!error || Object.keys(fieldErrorsOf(error)).length > 0) return null
  return (
    <p role="alert" className="font-label-sm text-label-sm text-error text-center">
      {errorMessage(error)}
    </p>
  )
}

export function CalculatorHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <>
      <Link
        to="/calculators"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow-left" size={20} />
        Calculators
      </Link>
      <header className="mb-xl flex flex-wrap items-start justify-between gap-md">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
            {title}
          </h1>
          <p className="font-body-md text-body-md text-secondary">{description}</p>
        </div>
        {action}
      </header>
    </>
  )
}

/**
 * The app-wide unit, for forms that take measurements. Numbers typed in one unit
 * mean nothing in the other, so switching clears the form through `onReset`.
 */
export function useCalculatorUnit(onReset: () => void) {
  const { unit, setUnit } = useUnits()
  const [lastUnit, setLastUnit] = useState<Units>(unit)
  if (lastUnit !== unit) {
    setLastUnit(unit)
    onReset()
  }
  return { unit, setUnit, weightLabel: unit === 'imperial' ? 'lbs' : 'kg', lengthLabel: unit === 'imperial' ? 'in' : 'cm' }
}
