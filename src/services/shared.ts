import type { Page, PagedDto } from '../types/shared'

export const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1)

export const titleCase = (value: string): string => value.split('_').map(capitalize).join(' ')

export const toPage = <TIn, TOut>(response: PagedDto<TIn>, map: (item: TIn) => TOut): Page<TOut> => ({
  data: response.data.map(map),
  meta: {
    total: response.total,
    page: response.current_page,
    perPage: response.per_page,
    lastPage: response.last_page,
  },
})

export const toSlug = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '-')

export const toSnake = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '_')

export const splitList = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
