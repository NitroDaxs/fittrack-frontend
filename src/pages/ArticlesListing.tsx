import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { ArticleCard } from '../components/cards'
import SearchInput from '../components/ui/SearchInput'
import FilterChips from '../components/ui/FilterChips'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'
import { useArticles } from '../hooks/useArticles'
import { useDebounced } from '../hooks/useDebounced'
import { useTaxonomies } from '../hooks/useTaxonomies'

export default function ArticlesListing() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const debouncedSearch = useDebounced(search)
  const taxonomies = useTaxonomies()

  const { data, isPending: loading, error, refetch } = useArticles({ search: debouncedSearch, category })

  const articles = data?.data ?? []
  const [featured, ...rest] = articles

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          {t('common.performanceJournal')}
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-2xl mb-lg">
          {t('articlesListing.evidenceLedWritingOnTrainingNutrition')}
        </p>
        <SearchInput value={search} onChange={setSearch} placeholder={t('common.searchArticles')} className="max-w-xl mb-lg" />
        {/* articleCategories, not categories -- the latter is the exercise
            taxonomy (strength/cardio/...) and never matches an article. */}
        <FilterChips
          label={t('common.category')}
          options={taxonomies?.articleCategories ?? []}
          value={category}
          onChange={setCategory}
          allLabel={t('articlesListing.allTopics')}
        />
      </header>

      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          icon="book-open"
          title={t('articlesListing.noArticlesFound')}
          body={t('articlesListing.tryADifferentTopicOrClear')}
        />
      ) : (
        <>
          <div className="mb-xl">
            <ArticleCard article={featured} featured />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {rest.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
