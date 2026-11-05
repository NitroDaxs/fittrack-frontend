import { useTranslation } from 'react-i18next'
import { forwardRef, useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Link } from 'react-router-dom'
import type { Sex } from '../../types/calculators'
import type { Units } from '../../types/shared'
import { useSetUnit } from '../../hooks/useUnits'
import { useUnitStore } from '../../store/unit.store'
import Icon from '../ui/Icon'

export const inputClass =
  'w-full bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset outline-none font-body-md text-on-surface transition-all focus:ring-2'

export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="font-label-sm text-label-sm text-error mt-xs flex items-center gap-xs">
      <Icon name="circle-alert" size={14} />
      {message}
    </p>
  )
}

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string
  label?: string
  ariaLabel?: string
  suffix?: string
  error?: string
}

/** A number box for react-hook-form: spread `register('field')` onto it. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { id, label, ariaLabel, suffix, error, ...props },
  ref,
) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type="number"
          step="any"
          inputMode="decimal"
          aria-label={ariaLabel}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} ${error ? 'ring-error focus:ring-error' : 'ring-surface-variant focus:ring-primary'}`}
          {...props}
        />
        {suffix ? (
          <span className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-secondary pointer-events-none">
            {suffix}
          </span>
        ) : null}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
})

interface HeightInputProps {
  feet: UseFormRegisterReturn
  inches: UseFormRegisterReturn
  cm: UseFormRegisterReturn
  errors: { height_feet?: string; height_inches?: string; height_cm?: string }
}

/** Height as ft + in or cm, following the app-wide unit. */
export function HeightInput({ feet, inches, cm, errors }: HeightInputProps) {
  const { t } = useTranslation()
  const unit = useUnitStore((state) => state.unit)
  return (
    <div>
      <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">{t('calculators.shared.height')}</span>
      {unit === 'imperial' ? (
        <div className="grid grid-cols-2 gap-md">
          <NumberInput id="height-feet" ariaLabel={t('calculators.shared.heightInFeet')} suffix="ft" error={errors.height_feet} {...feet} />
          <NumberInput id="height-inches" ariaLabel={t('calculators.shared.heightInInches')} suffix="in" error={errors.height_inches} {...inches} />
        </div>
      ) : (
        <NumberInput id="height-cm" ariaLabel={t('calculators.shared.heightInCentimeters')} suffix="cm" error={errors.height_cm} {...cm} />
      )}
    </div>
  )
}

export function SexToggle({ value, onChange }: { value: Sex; onChange: (value: Sex) => void }) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="font-label-bold text-label-bold text-on-surface-variant mb-xs block">{t('calculators.shared.sex')}</span>
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
            {t(`common.sex.${option}`)} </button>
        ))}
      </div>
    </div>
  )
}

export function CalculateButton({ pending }: { pending: boolean }) {
  const { t } = useTranslation()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-sm py-sm px-md rounded-lg shadow-sm font-label-bold text-label-bold text-on-primary bg-primary-container hover:bg-primary transition-colors active:scale-[0.98] disabled:opacity-60"
    >
      <Icon name="calculator" size={20} />
      {pending ? t('calculators.shared.calculating') : t('calculators.shared.calculate')}
    </button>
  )
}

export function CalculatorHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <>
      <Link
        to="/calculators"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow-left" size={20} />
        {t('common.calculators')}
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
export function useCalculatorUnit(onReset: (unit: Units) => void) {
  const unit = useUnitStore((state) => state.unit)
  const setUnit = useSetUnit()
  const lastUnit = useRef<Units>(unit)
  const resetRef = useRef(onReset)
  resetRef.current = onReset

  // An effect, not render: the reset updates react-hook-form's state.
  useEffect(() => {
    if (lastUnit.current === unit) return
    lastUnit.current = unit
    resetRef.current(unit)
  }, [unit])

  return { unit, setUnit, weightLabel: unit === 'imperial' ? 'lbs' : 'kg', lengthLabel: unit === 'imperial' ? 'in' : 'cm' }
}
