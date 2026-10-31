import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { tLabel } from '../../i18n'
import type { SelectOption } from '../../types/shared'
import { BODY_REGIONS, type BodyRegion, type BodySide } from './bodyMapRegions'

interface BodyMapProps {
  /** The selected muscle groups' slugs. Empty means no filter. */
  value: string[]
  onChange: (value: string[]) => void
  options: SelectOption[]
}

/**
 * Clickable front and back body diagrams, where several muscles can be selected. A
 * muscle is lit on both sides, and it's only clickable if the library has that group.
 */
export default function BodyMap({ value, onChange, options }: BodyMapProps) {
  const { t } = useTranslation()
  const [hovered, setHovered] = useState<string | null>(null)

  const labelFor = (slug: string | null) => {
    const option = options.find((item) => item.value === slug)
    return option ? tLabel(option.label) : null
  }

  const selected = value.map(labelFor).filter(Boolean).join(', ')

  const toggle = (slug: string) =>
    onChange(value.includes(slug) ? value.filter((item) => item !== slug) : [...value, slug])

  const regionClass = (slug: string) => {
    if (value.includes(slug)) return 'fill-primary'
    if (slug === hovered) return 'fill-primary-container'
    return 'fill-outline-variant'
  }

  const renderRegion = ({ muscle, d }: BodyRegion, index: number) => {
    const label = labelFor(muscle)
    if (!muscle || !label) return <path key={index} d={d} className="fill-surface-variant" />

    return (
      <path
        key={index}
        d={d}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={value.includes(muscle)}
        onClick={() => toggle(muscle)}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggle(muscle)
          }
        }}
        onMouseEnter={() => setHovered(muscle)}
        onMouseLeave={() => setHovered(null)}
        onFocus={() => setHovered(muscle)}
        onBlur={() => setHovered(null)}
        className={`cursor-pointer outline-none transition-colors ${regionClass(muscle)}`}
      >
        <title>{label}</title>
      </path>
    )
  }

  const renderSide = (side: BodySide) => (
    <figure className="flex-1 min-w-0">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 650" className="mx-auto h-auto w-full max-w-[170px]">
        {BODY_REGIONS[side].map(renderRegion)}
      </svg>
      <figcaption className="mt-xs text-center font-label-sm text-label-sm text-secondary">
        {t(`exerciseLibrary.body.${side}`)}
      </figcaption>
    </figure>
  )

  return (
    <div>
      <div className="flex items-center justify-between gap-sm mb-sm min-h-6">
        <span className="shrink-0 font-label-bold text-label-bold text-on-surface-variant">
          {t('exerciseLibrary.body.title')}
        </span>
        <span className="min-w-0 truncate font-label-sm text-label-sm text-primary" title={selected} aria-live="polite">
          {labelFor(hovered) ?? selected}
        </span>
      </div>
      <div className="flex items-start gap-md">
        {renderSide('front')}
        {renderSide('back')}
      </div>
    </div>
  )
}
