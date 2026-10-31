import { useTranslation } from 'react-i18next'
import { tLabel } from '../../i18n'
import type { SelectOption } from '../../types/shared'
import Icon from '../ui/Icon'
import type { ExerciseFilterValues } from './ExerciseFilters'

interface ActiveFiltersProps {
  values: ExerciseFilterValues
  options: { muscleGroups: SelectOption[]; equipment: SelectOption[]; difficulties: SelectOption[] }
  onChange: (values: ExerciseFilterValues) => void
  onClearAll?: () => void
  total?: number
}

/** The result count, plus a removable pill for each applied filter. */
export default function ActiveFilters({ values, options, onChange, onClearAll, total }: ActiveFiltersProps) {
  const { t } = useTranslation()

  const labelFor = (list: SelectOption[], value: string) => tLabel(list.find((option) => option.value === value)?.label ?? value)

  const pills = [
    ...values.muscleGroups.map((value) => ({
      key: `muscle-${value}`,
      label: labelFor(options.muscleGroups, value),
      remove: () => onChange({ ...values, muscleGroups: values.muscleGroups.filter((item) => item !== value) }),
    })),
    ...values.equipment.map((value) => ({
      key: `equipment-${value}`,
      label: labelFor(options.equipment, value),
      remove: () => onChange({ ...values, equipment: values.equipment.filter((item) => item !== value) }),
    })),
    ...(values.difficulty
      ? [{
          key: 'difficulty',
          label: labelFor(options.difficulties, values.difficulty),
          remove: () => onChange({ ...values, difficulty: null }),
        }]
      : []),
  ]

  return (
    <div className="flex flex-wrap items-center gap-sm">
      <span className="font-label-bold text-label-bold text-on-surface" aria-live="polite">
        {total === undefined ? t('exerciseLibrary.filtering') : t('exerciseLibrary.matching', { count: total })}
      </span>
      {pills.map((pill) => (
        <button
          key={pill.key}
          type="button"
          onClick={pill.remove}
          aria-label={t('exerciseLibrary.filters.remove', { name: pill.label })}
          className="flex items-center gap-xs rounded-full bg-primary-fixed py-xs pl-sm pr-xs font-label-sm text-label-sm text-on-primary-fixed-variant transition-colors hover:bg-primary-fixed-dim"
        >
          {pill.label}
          <Icon name="x" size={14} />
        </button>
      ))}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto flex items-center gap-xs font-label-bold text-label-bold text-primary transition-colors hover:text-primary-container"
        >
          <Icon name="funnel-x" size={18} />
          {t('common.clearFilters')}
        </button>
      ) : null}
    </div>
  )
}
