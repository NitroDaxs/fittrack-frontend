import { useState } from 'react'
import { ExerciseCard } from '../components/cards'
import FilterChips from '../components/ui/FilterChips'
import SearchInput from '../components/ui/SearchInput'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { useDebounced } from '../hooks/useDebounced'
import { useExercises } from '../hooks/useExercises'
import { useTaxonomies } from '../hooks/useTaxonomies'

const PER_PAGE = 8

export default function ExerciseLibrary() {
  const [search, setSearch] = useState('')
  const [muscleGroup, setMuscleGroup] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounced(search)

  const taxonomies = useTaxonomies()

  const { data, isPending: loading, error, refetch } = useExercises({ search: debouncedSearch, muscleGroup, equipment, difficulty, page, perPage: PER_PAGE })

  const exercises = data?.data ?? []
  const meta = data?.meta
  const activeFilters = [muscleGroup, equipment, difficulty].filter(Boolean).length

  // Any filter change invalidates the current page number.
  const withPageReset = <T,>(setter: (value: T) => void) => (value: T) => {
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
              <Icon name="funnel-x" size={18} />
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

      <Pagination page={page} lastPage={meta?.lastPage ?? 1} onPageChange={setPage} />
    </div>
  )
}
