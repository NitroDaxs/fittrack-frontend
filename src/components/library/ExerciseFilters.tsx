import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { tLabel } from '../../i18n'
import type { SelectOption } from '../../types/shared'
import Icon from '../ui/Icon'
import MultiSelect from '../ui/MultiSelect'
import BodyMap from './BodyMap'

const MAP_HIDDEN_KEY = 'fittrack.library.mapHidden'

function readMapHidden(): boolean {
  try {
    return window.localStorage.getItem(MAP_HIDDEN_KEY) === 'true'
  } catch {
    return false
  }
}

export interface ExerciseFilterValues {
  muscleGroups: string[]
  equipment: string[]
  difficulty: string | null
}

export const NO_FILTERS: ExerciseFilterValues = { muscleGroups: [], equipment: [], difficulty: null }

interface FilterOptions {
  muscleGroups: SelectOption[]
  equipment: SelectOption[]
  difficulties: SelectOption[]
}

interface ExerciseFiltersProps {
  values: ExerciseFilterValues
  options: FilterOptions
  onChange: (values: ExerciseFilterValues) => void
  /** Shown under the controls. */
  children?: ReactNode
}

export default function ExerciseFilters({ values, options, onChange, children }: ExerciseFiltersProps) {
  const { t } = useTranslation()
  const [mapHidden, setMapHidden] = useState(readMapHidden)

  const toggleMap = () => {
    const next = !mapHidden
    setMapHidden(next)
    try {
      window.localStorage.setItem(MAP_HIDDEN_KEY, String(next))
    } catch {
      /* storage unavailable -- the choice lasts until the page closes */
    }
  }

  const difficulties = [{ value: null, label: t('common.all') }, ...options.difficulties.map((option) => ({ value: option.value, label: tLabel(option.label) }))]

  return (
    <div className={`grid grid-cols-1 gap-lg ${mapHidden ? '' : 'lg:grid-cols-[320px_1fr]'}`}>
      {mapHidden ? null : (
        <BodyMap
          value={values.muscleGroups}
          onChange={(muscleGroups) => onChange({ ...values, muscleGroups })}
          options={options.muscleGroups}
        />
      )}

      <div className={`flex flex-col gap-md ${mapHidden ? '' : 'lg:border-l lg:border-surface-variant lg:pl-lg'}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
          <MultiSelect
            label={t('exerciseLibrary.muscleGroup')}
            placeholder={t('exerciseLibrary.filters.allMuscles')}
            options={options.muscleGroups}
            value={values.muscleGroups}
            onChange={(muscleGroups) => onChange({ ...values, muscleGroups })}
          />
          <MultiSelect
            label={t('common.equipment')}
            placeholder={t('exerciseLibrary.filters.allEquipment')}
            options={options.equipment}
            value={values.equipment}
            onChange={(equipment) => onChange({ ...values, equipment })}
          />
        </div>

        <div>
          <span className="block font-label-bold text-label-bold text-on-surface-variant mb-xs">{t('common.difficulty')}</span>
          <div role="group" aria-label={t('common.difficulty')} className="flex overflow-hidden rounded-lg border border-surface-variant">
            {difficulties.map((option) => (
              <button
                key={option.value ?? 'all'}
                type="button"
                aria-pressed={values.difficulty === option.value}
                onClick={() => onChange({ ...values, difficulty: option.value })}
                className={`flex-1 border-l border-surface-variant px-xs py-sm font-label-bold text-label-bold transition-colors first:border-l-0 ${
                  values.difficulty === option.value
                    ? 'bg-primary-container text-on-primary'
                    : 'bg-surface text-secondary hover:bg-surface-container'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {children ? <div className="border-t border-surface-variant pt-md">{children}</div> : null}

        <button
          type="button"
          onClick={toggleMap}
          aria-pressed={!mapHidden}
          className="mt-auto flex items-center gap-xs self-start font-label-sm text-label-sm text-secondary transition-colors hover:text-primary"
        >
          <Icon name="person-standing" size={16} />
          {mapHidden ? t('exerciseLibrary.filters.showMap') : t('exerciseLibrary.filters.hideMap')}
        </button>
      </div>
    </div>
  )
}
