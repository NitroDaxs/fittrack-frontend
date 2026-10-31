import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import i18n from '../i18n'
import { fieldErrorsOf } from '../services/http'
import type { Page } from '../types/shared'
import type { AdminQuery } from '../types/admin'
import { useDebounced } from './useDebounced'

export interface Sort {
  key: string
  dir: 'asc' | 'desc'
}

interface CrudApi<TRow, TForm> {
  list: (query: AdminQuery, signal?: AbortSignal) => Promise<Page<TRow>>
  create: (form: TForm) => Promise<unknown>
  update: (id: number, form: TForm) => Promise<unknown>
  remove: (id: number) => Promise<unknown>
}

interface Options {
  /** Names this table's entries in the query cache. */
  resource: string
  defaultSort?: Sort | null
  extraQuery?: AdminQuery
}

/**
 * Shared plumbing for the admin tables: paging, search, sort, the add/edit modal
 * and delete confirmation. All of it runs on the server.
 *
 * `editing` is the row being edited, `'new'` for the add form, or null when closed.
 */
export function useCrud<TRow extends { id: number }, TForm>(
  api: CrudApi<TRow, TForm>,
  { resource, defaultSort = null, extraQuery = {} }: Options,
) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort | null>(defaultSort)
  const [editing, setEditing] = useState<TRow | 'new' | null>(null)
  const [deleting, setDeleting] = useState<TRow | null>(null)

  const debouncedSearch = useDebounced(search)

  // Any change to what's being listed makes the current page number meaningless.
  const listKey = JSON.stringify([debouncedSearch, sort, extraQuery])
  const [paging, setPaging] = useState({ key: listKey, page: 1 })
  const page = paging.key === listKey ? paging.page : 1
  const setPage = useCallback((next: number) => setPaging({ key: listKey, page: next }), [listKey])

  const query: AdminQuery = { search: debouncedSearch, sort: sort?.key, dir: sort?.dir, page, ...extraQuery }

  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['admin', resource, 'list', query],
    queryFn: ({ signal }) => api.list(query, signal),
    placeholderData: keepPreviousData,
  })

  // Admin writes reach public catalogs, taxonomies and stats too, so refresh it all.
  const invalidateAll = () => queryClient.invalidateQueries()

  const saveMutation = useMutation({
    mutationFn: ({ row, form }: { row: TRow | null; form: TForm }) =>
      row ? api.update(row.id, form) : api.create(form),
    onSuccess: async (_result, { row }) => {
      toast.success(i18n.t(row ? 'toast.saved' : 'toast.created'))
      setEditing(null)
      await invalidateAll()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (row: TRow) => api.remove(row.id),
    onSuccess: async () => {
      toast.success(i18n.t('toast.deleted'))
      await invalidateAll()
    },
    onSettled: () => setDeleting(null),
  })

  const editingRow = editing && editing !== 'new' ? editing : null
  const fieldErrors = fieldErrorsOf(saveMutation.error)
  const { reset: resetSave } = saveMutation

  const openEditor = useCallback(
    (row: TRow | 'new' | null) => {
      resetSave()
      setEditing(row)
    },
    [resetSave],
  )

  return {
    rows: data?.data ?? [],
    meta: data?.meta,
    loading: isPending,
    error,
    refetch,
    search,
    setSearch,
    sort,
    setSort,
    page,
    setPage,
    editing,
    /** The row being edited, or null for a new record or a closed editor. */
    editingRow,
    setEditing: openEditor,
    deleting,
    setDeleting,
    saving: saveMutation.isPending,
    save: (form: TForm) => saveMutation.mutate({ row: editingRow, form }),
    fieldErrors,
    confirmDelete: () => {
      if (deleting) deleteMutation.mutate(deleting)
    },
  }
}
