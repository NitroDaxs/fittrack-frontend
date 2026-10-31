import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import type { Exercise } from '../../types/exercises'
import type { ProgrammeDay, ProgrammeExercise } from '../../types/routines'
import Icon from '../ui/Icon'
import { TextField } from '../ui/Field'
import { useAdminExercisePicker } from '../../hooks/useAdmin'
import { useDebounced } from '../../hooks/useDebounced'

interface RoutineDayBuilderProps {
  days: ProgrammeDay[]
  onChange: (days: ProgrammeDay[]) => void
  daysPerWeek: number | string
}

/**
 * Day-by-day programme editor for a routine.
 *
 * A routine is a shell without this: `routines` holds the metadata, `workouts`
 * are its days, and `workout_exercises` are the movements inside a day. The
 * whole structure is saved in one atomic request, so this component owns the
 * draft and only hands the finished array back on submit.
 */
export default function RoutineDayBuilder({ days, onChange, daysPerWeek }: RoutineDayBuilderProps) {
  const { t } = useTranslation()
  const [activeDay, setActiveDay] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search)

  // Only query once there's something to search -- the library has 300+ rows and
  // an empty term would pull the first page on every modal open.
  const { data: results, isLoading: loading } = useAdminExercisePicker(debouncedSearch)

  const current = days[activeDay]

  const update = (nextDays: ProgrammeDay[]) => onChange(nextDays)

  const mutateDay = (index: number, patch: Partial<ProgrammeDay>) =>
    update(days.map((day, i) => (i === index ? { ...day, ...patch } : day)))

  const addDay = () =>
    update([...days, { name: t('common.day', { n: days.length + 1 }), exercises: [] }])

  const removeDay = (index: number) => {
    update(days.filter((_, i) => i !== index))
    setActiveDay((prev) => Math.max(0, Math.min(prev, days.length - 2)))
  }

  /** Fills the schedule out to days_per_week in one click. */
  const fillToTarget = () => {
    const target = Number(daysPerWeek) || 0
    if (target <= days.length) return
    const extra = Array.from({ length: target - days.length }, (_, i) => ({
      name: t('common.day', { n: days.length + i + 1 }),
      exercises: [],
    }))
    update([...days, ...extra])
  }

  const addExercise = (exercise: Exercise) => {
    if (!current) return
    // Same movement twice in one day is almost always a mis-click.
    if (current.exercises.some((entry) => entry.exercise_id === exercise.id)) return

    mutateDay(activeDay, {
      exercises: [
        ...current.exercises,
        {
          exercise_id: exercise.id,
          name: exercise.name,
          target_sets: 3,
          target_reps: '8-12',
          rest_seconds: 120,
          notes: '',
        },
      ],
    })
    setSearch('')
  }

  const mutateExercise = (index: number, patch: Partial<ProgrammeExercise>) =>
    mutateDay(activeDay, {
      exercises: current.exercises.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    })

  const removeExercise = (index: number) =>
    mutateDay(activeDay, { exercises: current.exercises.filter((_, i) => i !== index) })

  /** Order is array position -- the API derives `order` from it on save. */
  const moveExercise = (index: number, direction: number) => {
    const target = index + direction
    if (target < 0 || target >= current.exercises.length) return
    const next = [...current.exercises]
    ;[next[index], next[target]] = [next[target], next[index]]
    mutateDay(activeDay, { exercises: next })
  }

  const totalExercises = useMemo(
    () => days.reduce((sum, day) => sum + day.exercises.length, 0),
    [days]
  )

  const shortfall = (Number(daysPerWeek) || 0) - days.length

  return (
    <section className="border border-surface-variant rounded-xl overflow-hidden">
      <header className="px-md py-sm bg-surface-container-low border-b border-surface-variant flex flex-wrap items-center justify-between gap-sm">
        <div>
          <span className="block font-label-bold text-label-bold text-on-surface">{t('admin.shared.programme')}</span>
          <span className="block font-label-sm text-label-sm text-secondary">
            {days.length} {days.length === 1 ? t('common.day2') : 'days'} · {totalExercises}{' '}
            {totalExercises === 1 ? 'exercise' : 'exercises'}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          {shortfall > 0 ? (
            <button
              type="button"
              onClick={fillToTarget}
              className="font-label-sm text-label-sm text-primary hover:underline px-sm py-xs"
            >
              {t('admin.shared.addToMatchWk', { count: shortfall, target: daysPerWeek })}
            </button>
          ) : null}
          <button
            type="button"
            onClick={addDay}
            className="flex items-center gap-xs font-label-bold text-label-sm border border-outline text-on-surface px-sm py-xs rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="plus" size={16} />
            {t('admin.shared.addDay')}
          </button>
        </div>
      </header>

      {days.length === 0 ? (
        <div className="p-lg text-center">
          <p className="font-body-md text-sm text-secondary mb-sm">
            {t('admin.shared.thisRoutineHasNoDaysYet')}
          </p>
          <button
            type="button"
            onClick={daysPerWeek ? fillToTarget : addDay}
            className="font-label-bold text-label-sm bg-primary-container text-on-primary px-md py-sm rounded-lg hover:bg-primary transition-colors"
          >
            {daysPerWeek ? t('admin.shared.createDays', { n: daysPerWeek }) : t('admin.shared.addTheFirstDay')}
          </button>
        </div>
      ) : (
        <>
          {/* Day tabs */}
          <div className="flex gap-xs overflow-x-auto no-scrollbar px-md pt-sm border-b border-surface-variant">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveDay(index)}
                aria-pressed={index === activeDay}
                className={`px-sm py-xs rounded-t-lg font-label-sm text-label-sm whitespace-nowrap border-b-2 transition-colors ${
                  index === activeDay
                    ? 'border-primary text-primary bg-surface-container-lowest'
                    : 'border-transparent text-secondary hover:text-on-surface'
                }`}
              >
                {day.name || t('common.day', { n: index + 1 })}
                <span className="ml-xs text-[10px] opacity-70">{day.exercises.length}</span>
              </button>
            ))}
          </div>

          {current ? (
            <div className="p-md flex flex-col gap-md">
              <div className="flex items-end gap-sm">
                <div className="flex-1">
                  <TextField
                    label={t('admin.shared.dayName')}
                    name={`day-name-${activeDay}`}
                    value={current.name}
                    onChange={(event) => mutateDay(activeDay, { name: event.target.value })}
                    placeholder={t('admin.shared.pushDayA')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDay(activeDay)}
                  className="text-secondary hover:text-error p-sm rounded-lg hover:bg-error-container/40 transition-colors"
                  aria-label={t('common.remove', { name: current.name || t('common.day2') })}
                >
                  <Icon name="trash-2" size={20} />
                </button>
              </div>

              {/* Exercises in this day */}
              {current.exercises.length === 0 ? (
                <p className="font-body-md text-sm text-secondary text-center py-md">
                  {t('admin.shared.noExercisesInThisDayYet')}
                </p>
              ) : (
                <ul className="flex flex-col gap-sm">
                  {current.exercises.map((entry, index) => (
                    <li
                      key={`${entry.exercise_id}-${index}`}
                      className="border border-surface-variant rounded-lg p-sm bg-surface-container-lowest"
                    >
                      <div className="flex items-center gap-sm mb-sm">
                        <span className="font-label-bold text-label-sm text-secondary w-5 shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-label-bold text-label-bold text-on-surface flex-1 truncate">
                          {entry.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, -1)}
                          disabled={index === 0}
                          aria-label={t('admin.shared.moveUp')}
                          className="text-secondary hover:text-primary p-xs rounded disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icon name="arrow-up" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, 1)}
                          disabled={index === current.exercises.length - 1}
                          aria-label={t('admin.shared.moveDown')}
                          className="text-secondary hover:text-primary p-xs rounded disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icon name="arrow-down" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          aria-label={t('common.remove', { name: entry.name })}
                          className="text-secondary hover:text-error p-xs rounded"
                        >
                          <Icon name="x" size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-sm">
                        <label className="flex flex-col gap-[2px]">
                          <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                            {t('common.sets')}
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={entry.target_sets ?? ''}
                            onChange={(event) =>
                              mutateExercise(index, {
                                target_sets: event.target.value === '' ? null : Number(event.target.value),
                              })
                            }
                            className="bg-surface-container-low rounded-lg py-xs px-sm text-sm ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none"
                          />
                        </label>
                        <label className="flex flex-col gap-[2px]">
                          <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                            {t('common.reps')}
                          </span>
                          <input
                            type="text"
                            value={entry.target_reps ?? ''}
                            onChange={(event) => mutateExercise(index, { target_reps: event.target.value })}
                            placeholder="8-12"
                            className="bg-surface-container-low rounded-lg py-xs px-sm text-sm ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none"
                          />
                        </label>
                        <label className="flex flex-col gap-[2px]">
                          <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                            {t('admin.shared.restS')}
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="900"
                            step="15"
                            value={entry.rest_seconds ?? ''}
                            onChange={(event) =>
                              mutateExercise(index, {
                                rest_seconds: event.target.value === '' ? null : Number(event.target.value),
                              })
                            }
                            className="bg-surface-container-low rounded-lg py-xs px-sm text-sm ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none"
                          />
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Library search */}
              <div className="border-t border-surface-variant pt-md">
                <TextField
                  label={t('common.addAnExercise')}
                  name="exercise-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('admin.shared.searchTheLibraryTypeAtLeast')}
                />
                {debouncedSearch.trim().length >= 2 ? (
                  <div className="mt-sm flex flex-col gap-xs max-h-48 overflow-y-auto custom-scrollbar">
                    {loading ? (
                      <span className="font-label-sm text-label-sm text-secondary px-sm py-xs">{t('common.searching')}</span>
                    ) : (results?.data ?? []).length === 0 ? (
                      <span className="font-label-sm text-label-sm text-secondary px-sm py-xs">
                        {t('admin.shared.nothingMatches', { query: debouncedSearch })}
                      </span>
                    ) : (
                      (results?.data ?? []).map((exercise) => {
                        const already = current.exercises.some((e) => e.exercise_id === exercise.id)
                        return (
                          <button
                            key={exercise.id}
                            type="button"
                            onClick={() => addExercise(exercise)}
                            disabled={already}
                            className="flex items-center gap-sm text-left px-sm py-xs rounded-lg border border-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          >
                            <Icon name={already ? 'check' : 'plus'} size={16} />
                            <span className="font-label-sm text-label-sm flex-1 truncate">{exercise.name}</span>
                            <span className="font-label-sm text-[10px] text-secondary truncate max-w-[40%]">
                              {exercise.primaryMuscles}
                            </span>
                          </button>
                        )
                      })
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}
