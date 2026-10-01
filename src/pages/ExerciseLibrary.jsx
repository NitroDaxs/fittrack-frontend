import { useMemo, useState } from 'react'
import { exercisesApi } from '../api/resources'
import { useDebounced, useResource } from '../api/hooks'
import { useTaxonomies } from '../context/TaxonomyContext'
import { ExerciseCard } from '../components/cards'
import FilterChips from '../components/ui/FilterChips'
import SearchInput from '../components/ui/SearchInput'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'
import Icon from '../components/ui/Icon'

const PER_PAGE = 8

// How many pages to show either side of the current one.
const PAGE_SPAN = 1

/**
 * Page numbers to render: always the first and last, a window around the
 * current page, and an ellipsis wherever that skips a run. With 38 pages of
 * exercises, listing every button was unusable.
 *
 * The window is nudged inward at the ends so the control keeps a roughly
 * constant width instead of shrinking on page 1 and growing in the middle.
 */
function pageItems(current, last) {
  const windowSize = PAGE_SPAN * 2 + 1
  if (last <= windowSize + 4) {
    return Array.from({ length: last }, (_, i) => ({ key: i + 1, page: i + 1 }))
  }

  let start = Math.max(2, current - PAGE_SPAN)
  let end = Math.min(last - 1, current + PAGE_SPAN)

  if (end - start + 1 < windowSize) {
    if (start === 2) end = Math.min(last - 1, start + windowSize - 1)
    else start = Math.max(2, end - windowSize + 1)
  }

  const pages = [1, ...Array.from({ length: end - start + 1 }, (_, i) => start + i), last]

  const items = []
  let previous = 0
  for (const page of pages) {
    if (previous && page - previous > 1) items.push({ key: `gap-${previous}`, gap: true })
    items.push({ key: page, page })
    previous = page
  }
  return items
}

export default function ExerciseLibrary() {
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState(null)
  const [equipment, setEquipment] = useState(null)
  const [difficulty, setDifficulty] = useState(null)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounced(search)

  const taxonomies = useTaxonomies()

  const query = useMemo(
    () => ({ search: debouncedSearch, muscleGroup, equipment, difficulty, page, perPage: PER_PAGE }),
    [debouncedSearch, muscleGroup, equipment, difficulty, page]
  )

  const { data, loading, error, refetch } = useResource(() => exercisesApi.list(query), [query])

  const exercises = data?.data ?? []
  const meta = data?.meta
  const activeFilters = [muscleGroup, equipment, difficulty].filter(Boolean).length

  // Any filter change invalidates the current page number.
  const withPageReset = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const clearAll = () => {
    setSearch('')
    setMuscleGroup(null)
    setEquipment(null)
    setDifficulty(null)
    setPage(1)
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full py-xl">
      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-sm">
          Exercise Library
        </h1>
        <p className="text-secondary mb-lg max-w-2xl font-body-md">
          Discover and master hundreds of exercises tailored for every fitness level and equipment type.
        </p>
        <SearchInput
          value={search}
          onChange={withPageReset(setSearch)}
          placeholder="Search exercises..."
          className="max-w-xl"
        />
      </header>

      <section className="mb-xl bg-surface-container-lowest p-md rounded-xl elev-card border border-surface-variant">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <FilterChips
            label="Muscle Group"
            options={taxonomies?.muscleGroups ?? []}
            value={muscleGroup}
            onChange={withPageReset(setMuscleGroup)}
          />
          <FilterChips
            label="Equipment"
            options={taxonomies?.equipment ?? []}
            value={equipment}
            onChange={withPageReset(setEquipment)}
          />
          <FilterChips
            label="Difficulty"
            options={taxonomies?.difficulties ?? []}
            value={difficulty}
            onChange={withPageReset(setDifficulty)}
          />
        </div>
        {activeFilters > 0 || search ? (
          <div className="flex items-center justify-between mt-lg pt-md border-t border-surface-variant">
            <span className="font-label-sm text-label-sm text-secondary">
              {meta ? `${meta.total} matching ${meta.total === 1 ? 'exercise' : 'exercises'}` : 'Filtering…'}
            </span>
            <button
              type="button"
              onClick={clearAll}
              className="font-label-bold text-label-bold text-primary hover:text-primary-container transition-colors flex items-center gap-xs"
            >
              <Icon name="filter_alt_off" size={18} />
              Clear filters
            </button>
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : loading ? (
          Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
        ) : exercises.length === 0 ? (
          <EmptyState
            title="No exercises match those filters"
            body="Try widening the muscle group or equipment filter, or clear the search box."
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
          exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)
        )}
      </section>

      {meta && meta.lastPage > 1 ? (
        <div className="mt-xl flex justify-center gap-sm">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-surface-variant text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="chevron_left" />
          </button>
          <span className="sm:hidden flex items-center px-md font-label-bold text-label-bold text-secondary">
            Page {page} of {meta.lastPage}
          </span>

          {pageItems(page, meta.lastPage).map((item) =>
            item.gap ? (
              <span
                key={item.key}
                aria-hidden="true"
                className="hidden sm:flex w-10 h-10 items-center justify-center text-secondary"
              >
                …
              </span>
            ) : (
              <button
                key={item.key}
                type="button"
                onClick={() => setPage(item.page)}
                aria-label={`Page ${item.page}`}
                aria-current={item.page === page ? 'page' : undefined}
                className={`hidden sm:flex w-10 h-10 rounded-lg items-center justify-center font-label-bold text-label-bold transition-colors ${
                  item.page === page
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'border border-surface-variant text-secondary hover:bg-surface-container'
                }`}
              >
                {item.page}
              </button>
            )
          )}
          <button
            type="button"
            disabled={page === meta.lastPage}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-surface-variant text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
