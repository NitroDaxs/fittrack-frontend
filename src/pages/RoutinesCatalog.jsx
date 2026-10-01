import { useMemo, useState } from 'react'
import { routinesApi } from '../api/resources'
import { useDebounced, useResource } from '../api/hooks'
import { useTaxonomies } from '../context/TaxonomyContext'
import { RoutineCard } from '../components/cards'
import SearchInput from '../components/ui/SearchInput'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'
import Icon from '../components/ui/Icon'

export default function RoutinesCatalog() {
  const [search, setSearch] = useState('')
  const [goals, setGoals] = useState([])
  const [levels, setLevels] = useState([])
  const [daysPerWeek, setDaysPerWeek] = useState(null)

  const debouncedSearch = useDebounced(search)
  const taxonomies = useTaxonomies()

  const query = useMemo(
    () => ({ search: debouncedSearch, goals, levels, daysPerWeek }),
    [debouncedSearch, goals, levels, daysPerWeek]
  )

  const { data, loading, error, refetch } = useResource(() => routinesApi.list(query), [query])
  const routines = data?.data ?? []

  const toggle = (list, setList) => (value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const clearAll = () => {
    setSearch('')
    setGoals([])
    setLevels([])
    setDaysPerWeek(null)
  }

  const hasFilters = goals.length > 0 || levels.length > 0 || daysPerWeek !== null || search !== ''

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col md:flex-row gap-xl">
      <aside className="w-full md:w-64 flex-shrink-0 bg-surface rounded-lg elev-card border border-surface-variant p-md h-fit md:sticky md:top-28">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-md">Filters</h2>

        <fieldset className="mb-lg">
          <legend className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Goal</legend>
          <div className="flex flex-col gap-xs">
            {(taxonomies?.goals ?? []).map((goal) => (
              <label key={goal.value} className="flex items-center gap-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={goals.includes(goal.value)}
                  onChange={() => toggle(goals, setGoals)(goal.value)}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                  {goal.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-lg">
          <legend className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Experience</legend>
          <div className="flex flex-col gap-xs">
            {(taxonomies?.levels ?? []).map((level) => (
              <label key={level.value} className="flex items-center gap-sm cursor-pointer group">
                <input
                  type="checkbox"
                  checked={levels.includes(level.value)}
                  onChange={() => toggle(levels, setLevels)(level.value)}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                />
                <span className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                  {level.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-lg">
          <legend className="font-label-bold text-label-bold text-on-surface-variant mb-sm">Days/Week</legend>
          <div className="flex gap-sm">
            {[3, 4, 5].map((value) => {
              const active = daysPerWeek === value
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDaysPerWeek(active ? null : value)}
                  className={`px-sm py-xs border rounded font-body-md text-body-md transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary border-primary-container'
                      : 'border-outline-variant text-on-surface hover:border-primary'
                  }`}
                >
                  {value === 5 ? '5+' : value}
                </button>
              )
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={clearAll}
          disabled={!hasFilters}
          className="w-full bg-surface-container-high text-on-surface font-label-bold text-label-bold py-sm rounded hover:bg-surface-variant transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear Filters
        </button>
      </aside>

      <section className="flex-grow min-w-0">
        <header className="mb-lg">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-md mb-lg">
            <div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                Explore Routines
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
                Find the perfect plan for your goals.
              </p>
            </div>
            <div className="text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">
              {loading ? 'Searching…' : `Showing ${routines.length} ${routines.length === 1 ? 'routine' : 'routines'}`}
            </div>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search routines..." className="max-w-xl" />
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : loading ? (
            Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
          ) : routines.length === 0 ? (
            <EmptyState
              icon="event_busy"
              title="No routines match those filters"
              body="Loosen the goal or experience filters to see more programmes."
              action={
                <button
                  type="button"
                  onClick={clearAll}
                  className="font-label-bold text-label-bold bg-primary text-on-primary px-lg py-sm rounded-lg hover:bg-surface-tint transition-colors"
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)
          )}
        </div>
      </section>
    </div>
  )
}
