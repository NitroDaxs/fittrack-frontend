import { Link, useParams } from 'react-router-dom'
import { articlesApi } from '../api/resources'
import { useResource } from '../api/hooks'
import { ArticleCard } from '../components/cards'
import { ErrorState, Spinner } from '../components/ui/States'
import Icon from '../components/ui/Icon'
import Img from '../components/ui/Img'

function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return <h2 className="font-headline-md text-headline-md text-on-surface mt-xl mb-md">{block.text}</h2>
    case 'quote':
      return (
        <blockquote className="my-lg border-l-4 border-primary-container pl-lg py-sm">
          <Icon name="format_quote" size={28} className="text-primary-container mb-xs" />
          <p className="font-body-lg text-body-lg text-on-surface italic">{block.text}</p>
        </blockquote>
      )
    case 'callout':
      return (
        <aside className="my-lg bg-primary-fixed/50 border border-outline-variant rounded-xl p-lg flex gap-md">
          <Icon name="info" size={24} className="text-primary shrink-0" />
          <p className="font-body-md text-body-md text-on-surface">{block.text}</p>
        </aside>
      )
    // Every claim in an article should be checkable, so citations render as
    // real outbound links rather than plain text.
    case 'sources':
      return (
        <aside className="mt-xl border-t border-surface-variant pt-lg">
          <h2 className="font-label-bold text-label-bold text-secondary uppercase tracking-widest mb-md flex items-center gap-xs">
            <Icon name="menu_book" size={18} />
            Sources
          </h2>
          <ol className="flex flex-col gap-sm list-decimal pl-lg">
            {(block.items ?? []).map((item) => (
              <li key={item.url} className="font-body-md text-sm text-secondary">
                {item.label}{' '}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-[2px] whitespace-nowrap"
                >
                  View study
                  <Icon name="open_in_new" size={14} />
                </a>
              </li>
            ))}
          </ol>
        </aside>
      )
    default:
      return <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">{block.text}</p>
  }
}

export default function ArticleDetail() {
  const { slug } = useParams()
  const { data: article, loading, error, refetch } = useResource(() => articlesApi.show(slug), [slug])

  if (loading) return <Spinner label="Loading article" />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (!article) return null

  return (
    <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-lg">
      <Link
        to="/articles"
        className="inline-flex items-center gap-xs font-label-bold text-label-bold text-secondary hover:text-primary transition-colors mb-lg"
      >
        <Icon name="arrow_back" size={20} />
        Performance Journal
      </Link>

      <article className="max-w-3xl mx-auto">
        <header className="mb-xl">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">{article.category}</span>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mt-sm mb-md">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-md font-label-sm text-label-sm text-secondary">
            <span className="flex items-center gap-xs">
              <Icon name="person" size={16} />
              {article.author}
            </span>
            <span className="flex items-center gap-xs">
              <Icon name="calendar_today" size={16} />
              {new Date(article.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-xs">
              <Icon name="schedule" size={16} />
              {article.readMinutes} min read
            </span>
          </div>
        </header>

        {/* Articles have no image column yet, so skip the hero entirely rather
            than reserving 24rem for a placeholder icon. */}
        {article.image ? (
          <div className="rounded-xl overflow-hidden h-64 md:h-96 mb-xl elev-card bg-surface-container-high">
            <Img src={article.image} alt="" icon="article" imgClassName="w-full h-full object-cover" />
          </div>
        ) : null}

        <div className="mb-xl">
          {(article.body ?? []).map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>
      </article>

      {article.related?.length ? (
        <section className="border-t border-surface-variant pt-xl">
          <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
            {article.related.map((item) => (
              <ArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
