import type { PageQuery } from './shared'

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

export interface ArticleForm {
  title: string
  body: string
  category: string
  status: string
}

export interface ArticleQuery extends PageQuery {
  search?: string
  category?: string | null
}
