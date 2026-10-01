import { createContext, useContext } from 'react'
import { metaApi } from '../api/resources'
import { useResource } from '../api/hooks'

// Loads the taxonomy reference data (muscle groups, equipment, difficulties,
// goals, levels, categories) once for the whole app. Consumers read it via
// useTaxonomies() instead of each fetching it on mount.
const TaxonomyContext = createContext(null)

export function TaxonomyProvider({ children }) {
  const { data } = useResource(() => metaApi.taxonomies(), [])
  return <TaxonomyContext.Provider value={data}>{children}</TaxonomyContext.Provider>
}

/** Returns the taxonomies object (null until the initial load resolves). */
export function useTaxonomies() {
  return useContext(TaxonomyContext)
}
