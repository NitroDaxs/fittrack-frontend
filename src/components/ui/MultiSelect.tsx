import { useCallback, useId, useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { tLabel } from '../../i18n'
import type { SelectOption } from '../../types/shared'
import Icon from './Icon'

interface MultiSelectProps {
  label: string
  placeholder: string
  options: SelectOption[]
  value: string[]
  onChange: (value: string[]) => void
}

/** Dropdown with a checkbox for each option. */
export default function MultiSelect({ label, placeholder, options, value, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])
  useDismiss(open, close, root, button)

  const summary = options
    .filter((option) => value.includes(option.value))
    .map((option) => tLabel(option.label))
    .join(', ')

  const toggle = (option: string) =>
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option])

  return (
    <div ref={root} className="relative min-w-0">
      <span className="block font-label-bold text-label-bold text-on-surface-variant mb-xs">{label}</span>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-sm rounded-lg border bg-surface px-md py-sm font-body-md text-body-md transition-colors hover:border-primary/50 ${
          open ? 'border-primary' : 'border-surface-variant'
        }`}
      >
        <span className={`truncate ${value.length ? 'text-on-surface' : 'text-secondary'}`}>{summary || placeholder}</span>
        <span className="flex shrink-0 items-center gap-xs">
          {value.length ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-xs font-label-sm text-label-sm text-on-primary">
              {value.length}
            </span>
          ) : null}
          <Icon name="chevron-down" size={18} className={`text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute left-0 right-0 top-full z-30 mt-xs max-h-72 overflow-y-auto custom-scrollbar rounded-lg border border-surface-variant bg-surface-container-lowest p-xs elev-overlay"
        >
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-sm rounded-lg px-sm py-xs font-body-md text-body-md text-on-surface hover:bg-surface-container"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 shrink-0 accent-primary-container"
              />
              {tLabel(option.label)}
            </label>
          ))}
        </div>
      ) : null}
    </div>
  )
}
