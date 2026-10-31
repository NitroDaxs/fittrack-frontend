import { useQuery } from '@tanstack/react-query'
import { taxonomyService } from '../services/taxonomies'
import type { Taxonomies } from '../types/taxonomies'

/** Reference data for filters and forms (null until the first load resolves). */
export function useTaxonomies(): Taxonomies | null {
  const { data } = useQuery({ queryKey: ['taxonomies'], queryFn: taxonomyService.taxonomies, staleTime: Infinity })
  return data ?? null
}
