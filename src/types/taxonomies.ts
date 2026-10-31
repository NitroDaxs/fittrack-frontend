import type { TaxonomyDto } from './exercises'
import type { SelectOption } from './shared'

export interface OptionDto {
  id: string
  name: string
  slug: string
}

export interface TaxonomiesDto {
  muscles: TaxonomyDto[]
  equipment: TaxonomyDto[]
  difficulties: OptionDto[]
  categories: OptionDto[]
  articleCategories: OptionDto[]
  goals: OptionDto[]
  authors: string[]
}

export interface Taxonomies {
  muscleGroups: SelectOption[]
  equipment: SelectOption[]
  difficulties: SelectOption[]
  levels: SelectOption[]
  categories: SelectOption[]
  articleCategories: SelectOption[]
  goals: SelectOption[]
  authors: string[]
}
