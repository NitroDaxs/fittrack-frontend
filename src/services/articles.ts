import { endpoints } from './endpoints'
import { get } from './http'
import type { Article, ArticleCategoryValue, ArticleDto, ArticleForm, ArticleQuery, ArticleRequest, ArticleStatusValue } from '../types/articles'
import { capitalize, titleCase, toPage, toSlug, toSnake } from './shared'
import type { PagedDto } from '../types/shared'

export function toArticle(raw: ArticleDto): Article {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    category: titleCase(raw.category),
    status: capitalize(raw.status),
    excerpt: raw.excerpt,
    author: raw.author,
    date: raw.date,
    readMinutes: raw.readMinutes,
    image: raw.image,
    body: raw.body ?? [],
    related: (raw.related ?? []).map(toArticle),
  }
}

export function toArticleRequest(form: ArticleForm): ArticleRequest {
  const body = form.body.trim()
  return {
    title: form.title,
    category: toSnake(form.category) as ArticleCategoryValue,
    status: toSlug(form.status) as ArticleStatusValue,
    ...(body ? { body } : {}),
    image_url: form.imageUrl.trim(),
  }
}

export const articleService = {
  list: (query: ArticleQuery, signal?: AbortSignal) =>
    get<PagedDto<ArticleDto>>(endpoints.articles.list, { ...query }, signal).then((res) => toPage(res, toArticle)),
  show: (key: string) => get<ArticleDto>(endpoints.articles.show(key)).then(toArticle),
}
