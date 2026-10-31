// The API's wire format. Mirrors the DTOs in FitTrack.Application/Dtos: JSON is
// snake_case unless a DTO overrides the name, and enums are snake_case strings.
export type UserRole = 'member' | 'admin'

export type Units = 'imperial' | 'metric'

export type DifficultyValue = 'beginner' | 'intermediate' | 'advanced'

export interface PagedDto<T> {
  data: T[]
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
}

export interface MessageResponse {
  message: string
}

// What the UI works with: the wire format reshaped for display, with enum values
// turned into labels. `mappers.ts` is the only code that converts between the two.
export interface PageMeta {
  total: number
  page: number
  perPage: number
  lastPage: number
}

export interface Page<T> {
  data: T[]
  meta: PageMeta
}

export interface PageQuery {
  page?: number
  perPage?: number
}

export interface SelectOption {
  value: string
  label: string
}
