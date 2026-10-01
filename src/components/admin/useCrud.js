import { useCallback, useMemo, useState } from 'react'
import { useDebounced, useResource } from '../../api/hooks'

/**
 * Shared plumbing for the admin tables: search, sort, the add/edit modal, and
 * delete confirmation. Sort and search are passed to the API rather than applied
 * locally, so behaviour is unchanged when the mock is replaced.
 */
export function useCrud(api, { defaultSort = null, extraQuery = {} } = {}) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(defaultSort)
  const [editing, setEditing] = useState(null) // row being edited, or {} for "new"
  const [deleting, setDeleting] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const debouncedSearch = useDebounced(search)
  const extraKey = JSON.stringify(extraQuery)

  const query = useMemo(
    () => ({ search: debouncedSearch, sort: sort?.key, dir: sort?.dir, ...extraQuery }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [debouncedSearch, sort?.key, sort?.dir, extraKey]
  )

  const { data, loading, error, refetch } = useResource(() => api.list(query), [query])

  const flash = useCallback((message) => {
    setNotice(message)
    setTimeout(() => setNotice(null), 3000)
  }, [])

  const save = useCallback(
    async (values) => {
      setSaving(true)
      try {
        if (editing?.id) {
          await api.update(editing.id, values)
          flash('Changes saved.')
        } else {
          await api.create(values)
          flash('Record created.')
        }
        setEditing(null)
        refetch()
      } finally {
        setSaving(false)
      }
    },
    [api, editing, flash, refetch]
  )

  const confirmDelete = useCallback(async () => {
    if (!deleting) return
    await api.remove(deleting.id)
    setDeleting(null)
    flash('Record deleted.')
    refetch()
  }, [api, deleting, flash, refetch])

  return {
    rows: data?.data ?? [],
    meta: data?.meta,
    loading,
    error,
    refetch,
    search,
    setSearch,
    sort,
    setSort,
    editing,
    setEditing,
    deleting,
    setDeleting,
    saving,
    save,
    confirmDelete,
    notice,
  }
}
