import type { PageQuery } from './shared'
import type { AdminArticleValues } from '../schemas/admin-article.schema'

export type ArticleCategoryValue = 'nutrition' | 'training_theory' | 'recovery' | 'mindset'

export type ArticleStatusValue = 'draft' | 'published'

export interface ArticleTextBlock {
  type: 'p' | 'h2' | 'quote' | 'callout'
  text: string
}

export interface ArticleSourcesBlock {
  type: 'sources'
  items?: { label: string; url: string }[]
}

export type ArticleBlock = ArticleTextBlock | ArticleSourcesBlock

export interface ArticleDto {
  id: number
  slug: string
  title: string
  category: ArticleCategoryValue
  status: ArticleStatusValue
  excerpt: string
  author: string
  date: string
  readMinutes: number
  image: string
  /** Only on detail responses. */
  body?: ArticleBlock[]
  related?: ArticleDto[]
}

export interface ArticleRequest {
  title: string
  category: ArticleCategoryValue
  status: ArticleStatusValue
  /** Left out on edit to keep the current content. The API splits prose into blocks. */
  body?: string
  /** An empty string removes the image. */
  image_url: string
}

export interface Article {
  id: number
  slug: string
  title: string
  category: string
  status: string
  excerpt: string
  author: string
  date: string
  readMinutes: number
  image: string
  body: ArticleBlock[]
  related: Article[]
}

/** The admin form's values, inferred from `adminArticleSchema` so there is one source. */
export type ArticleForm = AdminArticleValues

export interface ArticleQuery extends PageQuery {
  search?: string
  category?: string | null
}
