import { useMemo, useState } from 'react'
import { articlesApi } from '../api/resources'
import { useDebounced, useResource } from '../api/hooks'
import { useTaxonomies } from '../context/TaxonomyContext'
import { ArticleCard } from '../components/cards'
import SearchInput from '../components/ui/SearchInput'
import FilterChips from '../components/ui/FilterChips'
import { EmptyState, ErrorState, SkeletonCard } from '../components/ui/States'

export default function ArticlesListing() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(null)

  const debouncedSearch = useDebounced(search)
  const taxonomies = useTaxonomies()

  const query = useMemo(
    () => ({ search: debouncedSearch, category, publishedOnly: true }),
    [debouncedSearch, category]
  )
  const { data, loading, error, refetch } = useResource(() => articlesApi.list(query), [query])

  const articles = data?.data ?? []
  const [featured, ...rest] = articles

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <header className="mb-xl">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Performance Journal
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-2xl mb-lg">
          Evidence-led writing on training, nutrition, recovery, and the mental side of lifting.
        </p>
        <SearchInput value={search} onChange={setSearch} placeholder="Search articles..." className="max-w-xl mb-lg" />
        {/* articleCategories, not categories -- the latter is the exercise
            taxonomy (strength/cardio/...) and never matches an article. */}
        <FilterChips
          label="Category"
          options={taxonomies?.articleCategories ?? []}
          value={category}
          onChange={setCategory}
          allLabel="All topics"
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
          icon="menu_book"
          title="No articles found"
          body="Try a different topic or clear the search box."
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
