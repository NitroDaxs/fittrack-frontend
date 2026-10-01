import { useMemo, useState } from 'react'
import { meApi } from '../api/resources'
import { useDebounced, useResource } from '../api/hooks'
import SearchInput from '../components/ui/SearchInput'
import { EmptyState, ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'

const ranges = ['Last 7 Days', 'Last 30 Days', 'This Month', 'All Time']

function formatWhen(iso) {
  const date = new Date(iso)
  const today = new Date()
  const diffDays = Math.floor((today - date) / 86400000)
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 0) return `Today, ${time}`
  if (diffDays === 1) return `Yesterday, ${time}`
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${time}`
}

export default function WorkoutHistory() {
  const [search, setSearch] = useState('')
  const [range, setRange] = useState('All Time')
  const [expandedId, setExpandedId] = useState(null)

  const debouncedSearch = useDebounced(search)
  const query = useMemo(() => ({ search: debouncedSearch, range }), [debouncedSearch, range])

  const { data, loading, error, refetch } = useResource(() => meApi.workouts(query), [query])
  const workouts = data?.data ?? []

  const { data: detail } = useResource(() => meApi.workout(expandedId), [expandedId], { skip: !expandedId })

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-lg">
          Workout History
        </h1>
        <div className="flex flex-col md:flex-row gap-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search workouts..."
            className="flex-1"
          />
          <div className="relative w-full md:w-56">
            <Icon
              name="calendar_today"
              size={20}
              className="absolute left-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
            />
            <select
              value={range}
              onChange={(event) => setRange(event.target.value)}
              aria-label="Filter by date range"
              className="w-full bg-surface-container-low border-transparent focus:ring-2 focus:ring-primary rounded-lg pl-xl pr-xl py-sm font-body-md text-on-surface appearance-none transition-colors shadow-sm outline-none"
            >
              {ranges.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              size={20}
              className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
            />
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading ? (
        <Spinner label="Loading workouts" />
      ) : workouts.length === 0 ? (
        <EmptyState
          icon="history_toggle_off"
          title="No workouts in this range"
          body="Try widening the date filter or clearing your search."
        />
      ) : (
        <div className="flex flex-col gap-md">
          {workouts.map((workout) => {
            const expanded = expandedId === workout.id
            return (
              <article
                key={workout.id}
                className="bg-surface-container-lowest rounded-xl elev-card border border-transparent hover:border-surface-variant transition-colors group overflow-hidden"
              >
                <div className="p-md flex flex-col md:flex-row md:items-center justify-between gap-md">
                  <div className="flex items-start gap-md min-w-0">
                    <span className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
                      <Icon name={workout.icon} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-headline-md text-body-lg md:text-headline-md text-on-surface mb-xs group-hover:text-primary transition-colors truncate">
                        {workout.name}
                      </h2>
                      <p className="font-body-md text-body-md text-secondary mb-sm">{formatWhen(workout.performedAt)}</p>
                      <div className="flex flex-wrap gap-xs">
                        {workout.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-surface-container-low text-on-surface-variant px-2 py-1 rounded-full font-label-sm text-label-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-surface-variant pt-md md:pt-0 md:pl-md shrink-0">
                    <div className="font-display-stat text-headline-md md:text-display-stat text-on-surface leading-none">
                      {workout.minutes}
                      <span className="text-body-md font-body-md text-secondary">m</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : workout.id)}
                      aria-expanded={expanded}
                      className="font-label-bold text-label-bold text-primary-container hover:text-primary transition-colors flex items-center gap-1 md:mt-sm"
                    >
                      {expanded ? 'Hide details' : 'View Details'}
                      <Icon name={expanded ? 'expand_less' : 'chevron_right'} size={18} />
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="border-t border-surface-variant bg-surface-container-low p-md">
                    {!detail || detail.id !== workout.id ? (
                      <Spinner label="Loading sets" />
                    ) : (
                      <ul className="space-y-sm">
                        {detail.entries.map((entry, index) => (
                          <li
                            key={`${entry.exerciseId}-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm bg-surface-container-lowest rounded-lg p-sm border border-surface-variant"
                          >
                            <span className="font-label-bold text-label-bold text-on-surface">
                              {entry.exercise?.name ?? `Exercise ${entry.exerciseId}`}
                            </span>
                            <span className="flex flex-wrap gap-xs">
                              {entry.sets.map((set, setIndex) => (
                                <span
                                  key={setIndex}
                                  className="font-label-sm text-label-sm text-secondary bg-surface-container px-sm py-xs rounded-full"
                                >
                                  {set.weight ? `${set.weight} lbs × ` : ''}
                                  {set.reps} reps
                                </span>
                              ))}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
