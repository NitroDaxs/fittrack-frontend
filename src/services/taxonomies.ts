import { endpoints } from './endpoints'
import { get } from './http'
import type { TaxonomyDto } from '../types/exercises'
import type { SelectOption } from '../types/shared'
import type { OptionDto, Taxonomies, TaxonomiesDto } from '../types/taxonomies'

const toOptions = (items: (TaxonomyDto | OptionDto)[]): SelectOption[] =>
  items.map((item) => ({ value: item.slug, label: item.name }))

export const toTaxonomies = (raw: TaxonomiesDto): Taxonomies => ({
  muscleGroups: toOptions(raw.muscles),
  equipment: toOptions(raw.equipment),
  difficulties: toOptions(raw.difficulties),
  // Routine "level" and exercise "difficulty" share one vocabulary.
  levels: toOptions(raw.difficulties),
  categories: toOptions(raw.categories),
  articleCategories: toOptions(raw.articleCategories),
  goals: toOptions(raw.goals),
  authors: raw.authors,
})

export const taxonomyService = {
  taxonomies: () => get<TaxonomiesDto>(endpoints.taxonomies).then(toTaxonomies),
}
