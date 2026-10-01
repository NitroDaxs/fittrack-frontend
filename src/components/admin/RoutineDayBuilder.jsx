import { useMemo, useState } from 'react'
import { adminApi } from '../../api/resources'
import { useDebounced, useResource } from '../../api/hooks'
import Icon from '../ui/Icon'
import { TextField } from '../ui/Field'

/**
 * Day-by-day programme editor for a routine.
 *
 * A routine is a shell without this: `routines` holds the metadata, `workouts`
 * are its days, and `workout_exercises` are the movements inside a day. The
 * whole structure is saved in one atomic request, so this component owns the
 * draft and only hands the finished array back on submit.
 *
 * `days` is the controlled value: [{ name, exercises: [{ exercise_id, name,
 * target_sets, target_reps, rest_seconds, notes }] }]
 */
export default function RoutineDayBuilder({ days, onChange, daysPerWeek }) {
  const [activeDay, setActiveDay] = useState(0)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search)

  // Only query once there's something to search -- the library has 300+ rows and
  // an empty term would pull the first page on every modal open.
  const { data: results, loading } = useResource(
    () => adminApi.exercises.list({ search: debouncedSearch, perPage: 6 }),
    [debouncedSearch],
    { skip: debouncedSearch.trim().length < 2 }
  )

  const current = days[activeDay]

  const update = (nextDays) => onChange(nextDays)

  const mutateDay = (index, patch) =>
    update(days.map((day, i) => (i === index ? { ...day, ...patch } : day)))

  const addDay = () =>
    update([...days, { name: `Day ${days.length + 1}`, exercises: [] }])

  const removeDay = (index) => {
    update(days.filter((_, i) => i !== index))
    setActiveDay((prev) => Math.max(0, Math.min(prev, days.length - 2)))
  }

  /** Fills the schedule out to days_per_week in one click. */
  const fillToTarget = () => {
    const target = Number(daysPerWeek) || 0
    if (target <= days.length) return
    const extra = Array.from({ length: target - days.length }, (_, i) => ({
      name: `Day ${days.length + i + 1}`,
      exercises: [],
    }))
    update([...days, ...extra])
  }

  const addExercise = (exercise) => {
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

  const mutateExercise = (index, patch) =>
    mutateDay(activeDay, {
      exercises: current.exercises.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    })

  const removeExercise = (index) =>
    mutateDay(activeDay, { exercises: current.exercises.filter((_, i) => i !== index) })

  /** Order is array position -- the API derives `order` from it on save. */
  const moveExercise = (index, direction) => {
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
          <span className="block font-label-bold text-label-bold text-on-surface">Programme</span>
          <span className="block font-label-sm text-label-sm text-secondary">
            {days.length} {days.length === 1 ? 'day' : 'days'} · {totalExercises}{' '}
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
              Add {shortfall} to match {daysPerWeek}/wk
            </button>
          ) : null}
          <button
            type="button"
            onClick={addDay}
            className="flex items-center gap-xs font-label-bold text-label-sm border border-outline text-on-surface px-sm py-xs rounded-lg hover:bg-surface-container transition-colors"
          >
            <Icon name="add" size={16} />
            Add day
          </button>
        </div>
      </header>

      {days.length === 0 ? (
        <div className="p-lg text-center">
          <p className="font-body-md text-sm text-secondary mb-sm">
            This routine has no days yet, so it would show as an empty programme.
          </p>
          <button
            type="button"
            onClick={daysPerWeek ? fillToTarget : addDay}
            className="font-label-bold text-label-sm bg-primary-container text-on-primary px-md py-sm rounded-lg hover:bg-primary transition-colors"
          >
            {daysPerWeek ? `Create ${daysPerWeek} days` : 'Add the first day'}
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
                {day.name || `Day ${index + 1}`}
                <span className="ml-xs text-[10px] opacity-70">{day.exercises.length}</span>
              </button>
            ))}
          </div>

          {current ? (
            <div className="p-md flex flex-col gap-md">
              <div className="flex items-end gap-sm">
                <div className="flex-1">
                  <TextField
                    label="Day name"
                    name={`day-name-${activeDay}`}
                    value={current.name}
                    onChange={(event) => mutateDay(activeDay, { name: event.target.value })}
                    placeholder="Push Day A"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeDay(activeDay)}
                  className="text-secondary hover:text-error p-sm rounded-lg hover:bg-error-container/40 transition-colors"
                  aria-label={`Remove ${current.name || 'day'}`}
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>

              {/* Exercises in this day */}
              {current.exercises.length === 0 ? (
                <p className="font-body-md text-sm text-secondary text-center py-md">
                  No exercises in this day yet — search the library below.
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
                          aria-label="Move up"
                          className="text-secondary hover:text-primary p-xs rounded disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icon name="arrow_upward" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, 1)}
                          disabled={index === current.exercises.length - 1}
                          aria-label="Move down"
                          className="text-secondary hover:text-primary p-xs rounded disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Icon name="arrow_downward" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          aria-label={`Remove ${entry.name}`}
                          className="text-secondary hover:text-error p-xs rounded"
                        >
                          <Icon name="close" size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-sm">
                        <label className="flex flex-col gap-[2px]">
                          <span className="font-label-sm text-[10px] text-secondary uppercase tracking-widest">
                            Sets
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
                            Reps
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
                            Rest (s)
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
                  label="Add an exercise"
                  name="exercise-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search the library — type at least 2 letters"
                />
                {debouncedSearch.trim().length >= 2 ? (
                  <div className="mt-sm flex flex-col gap-xs max-h-48 overflow-y-auto custom-scrollbar">
                    {loading ? (
                      <span className="font-label-sm text-label-sm text-secondary px-sm py-xs">Searching…</span>
                    ) : (results?.data ?? []).length === 0 ? (
                      <span className="font-label-sm text-label-sm text-secondary px-sm py-xs">
                        Nothing matches “{debouncedSearch}”.
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
                            <Icon name={already ? 'check' : 'add'} size={16} />
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
