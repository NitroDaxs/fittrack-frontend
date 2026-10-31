import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { articleService } from '../services/articles'
import type { ArticleQuery } from '../types/articles'

export const useArticles = (query: ArticleQuery) =>
  useQuery({
    queryKey: ['articles', 'list', query],
    queryFn: ({ signal }) => articleService.list(query, signal),
    placeholderData: keepPreviousData,
  })

export const useArticle = (key: string) =>
  useQuery({ queryKey: ['articles', 'detail', key], queryFn: () => articleService.show(key) })
