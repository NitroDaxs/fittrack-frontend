import { useTranslation } from 'react-i18next'
import ActiveFilters from '../components/library/ActiveFilters'
import ExerciseFilters, { NO_FILTERS, type ExerciseFilterValues } from '../components/library/ExerciseFilters'
import { useState } from 'react'
import { ExerciseCard } from '../components/cards'
import Modal from '../components/ui/Modal'
import SearchInput from '../components/ui/SearchInput'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import { Pagination } from '../components/ui/Pagination'
import { useDebounced } from '../hooks/useDebounced'
import { useExercises } from '../hooks/useExercises'
import { useTaxonomies } from '../hooks/useTaxonomies'

const PER_PAGE = 8

export default function ExerciseLibrary() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<ExerciseFilterValues>(NO_FILTERS)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounced(search)

  const taxonomies = useTaxonomies()

  const { data, isPending: loading, error, refetch } = useExercises({ search: debouncedSearch, ...filters, page, perPage: PER_PAGE })

  const exercises = data?.data ?? []
  const meta = data?.meta
  const activeFilters = filters.muscleGroups.length + filters.equipment.length + (filters.difficulty ? 1 : 0)
  const filterOptions = {
    muscleGroups: taxonomies?.muscleGroups ?? [],
    equipment: taxonomies?.equipment ?? [],
    difficulties: taxonomies?.difficulties ?? [],
  }

  // Any filter change invalidates the current page number.
  const withPageReset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value)
    setPage(1)
  }

  const applyFilters = withPageReset(setFilters)

  const clearAll = () => {
    setSearch('')
    setFilters(NO_FILTERS)
    setPage(1)
  }

  return (
    <div className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto w-full py-xl">
      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-sm">
          {t('common.exerciseLibrary')}
        </h1>
        <p className="text-secondary mb-lg max-w-2xl font-body-md">
          {t('exerciseLibrary.discoverAndMasterHundredsOfExercises')}
        </p>
        <SearchInput
          value={search}
          onChange={withPageReset(setSearch)}
          placeholder={t('common.searchExercises')}
          className="max-w-xl"
        />
      </header>

      {/* Desktop: always visible */}
      <section className="hidden lg:block mb-lg bg-surface-container-lowest p-md rounded-xl elev-card border border-surface-variant">
        <ExerciseFilters values={filters} options={filterOptions} onChange={applyFilters}>
          <ActiveFilters
            values={filters}
            options={filterOptions}
            onChange={applyFilters}
            onClearAll={activeFilters > 0 || search ? clearAll : undefined}
            total={meta?.total}
          />
        </ExerciseFilters>
      </section>

      {/* Phones and tablets: in a sheet, so the exercises come first */}
      <div className="lg:hidden mb-md">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex w-full items-center justify-center gap-sm rounded-lg border border-outline bg-surface py-sm font-label-bold text-label-bold text-on-surface transition-colors hover:bg-surface-container"
        >
          <Icon name="sliders-horizontal" size={18} />
          {t('exerciseLibrary.filters.title')}
          {activeFilters > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-container px-xs font-label-sm text-label-sm text-on-primary">
              {activeFilters}
            </span>
          ) : null}
        </button>
      </div>
      <Modal
        open={sheetOpen}
        title={t('exerciseLibrary.filters.title')}
        size="lg"
        onClose={() => setSheetOpen(false)}
        footer={
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="w-full rounded-lg bg-primary-container py-sm font-label-bold text-label-bold text-on-primary transition-colors hover:bg-primary"
          >
            {meta ? t('exerciseLibrary.filters.showResults', { count: meta.total }) : t('exerciseLibrary.filtering')}
          </button>
        }
      >
        <ExerciseFilters values={filters} options={filterOptions} onChange={applyFilters} />
      </Modal>

      <div className="lg:hidden mb-lg">
        <ActiveFilters
          values={filters}
          options={filterOptions}
          onChange={applyFilters}
          onClearAll={activeFilters > 0 || search ? clearAll : undefined}
          total={meta?.total}
        />
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : loading ? (
          Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
        ) : exercises.length === 0 ? (
          <EmptyState
            title={t('exerciseLibrary.noExercisesMatchThoseFilters')}
            body={t('exerciseLibrary.tryWideningTheMuscleGroupOr')}
            action={
              <button
                type="button"
                onClick={clearAll}
                className="font-label-bold text-label-bold bg-primary text-on-primary px-lg py-sm rounded-lg hover:bg-surface-tint transition-colors"
              >
                {t('common.clearFilters')}
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
