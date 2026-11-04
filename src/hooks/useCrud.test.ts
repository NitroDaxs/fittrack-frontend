import { act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../i18n'
import { renderHookWithProviders } from '../test/utils'
import type { Page } from '../types/shared'
import { useCrud } from './useCrud'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

interface Row {
  id: number
  name: string
}

const page = (rows: Row[], lastPage = 3): Page<Row> => ({ data: rows, meta: { total: rows.length, page: 1, perPage: 10, lastPage } })

const makeApi = () => ({
  list: vi.fn().mockResolvedValue(page([{ id: 1, name: 'One' }])),
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  remove: vi.fn().mockResolvedValue({}),
})

let api: ReturnType<typeof makeApi>

beforeEach(() => {
  api = makeApi()
  vi.mocked(toast.success).mockClear()
})

const setup = (options: Partial<Parameters<typeof useCrud>[1]> = {}) =>
  renderHookWithProviders(() => useCrud<Row, { name: string }>(api, { resource: 'things', ...options }))

describe('useCrud listing', () => {
  it('loads the first page with the default sort and extra filters', async () => {
    const { result } = setup({ defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { status: 'draft' } })
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 1, name: 'One' }]))
    expect(result.current.loading).toBe(false)
    expect(result.current.meta?.lastPage).toBe(3)
    expect(api.list).toHaveBeenCalledWith({ search: '', sort: 'name', dir: 'asc', page: 1, status: 'draft' }, expect.any(AbortSignal))
  })

  it('debounces the search before querying', async () => {
    const { result } = setup()
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(1))
    act(() => result.current.setSearch('ab'))
    expect(result.current.search).toBe('ab')
    expect(api.list).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'ab' }), expect.anything()))
  })

  it('goes back to page 1 when the sort or search changes', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.rows).toHaveLength(1))
    act(() => result.current.setPage(3))
    expect(result.current.page).toBe(3)
    await waitFor(() => expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 3 }), expect.anything()))

    act(() => result.current.setSort({ key: 'name', dir: 'desc' }))
    expect(result.current.page).toBe(1)
    await waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, sort: 'name', dir: 'desc' }), expect.anything()),
    )
  })

  it('exposes list errors', async () => {
    api.list.mockRejectedValue(new Error('down'))
    const { result } = setup()
    await waitFor(() => expect(result.current.error?.message).toBe('down'))
    expect(result.current.rows).toEqual([])
  })
})

describe('useCrud editing', () => {
  it('creates a record from the "new" editor, then closes it and refreshes', async () => {
    const { result, queryClient } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    await waitFor(() => expect(result.current.rows).toHaveLength(1))

    act(() => result.current.setEditing('new'))
    expect(result.current.editing).toBe('new')
    expect(result.current.editingRow).toBeNull()

    act(() => result.current.save({ name: 'Two' }))
    await waitFor(() => expect(result.current.editing).toBeNull())
    expect(api.create).toHaveBeenCalledWith({ name: 'Two' })
    expect(api.update).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith(i18n.t('toast.created'))
    expect(invalidate).toHaveBeenCalledWith()
  })

  it('updates the row being edited', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.rows).toHaveLength(1))
    act(() => result.current.setEditing(result.current.rows[0]))
    expect(result.current.editingRow).toEqual({ id: 1, name: 'One' })

    act(() => result.current.save({ name: 'Uno' }))
    await waitFor(() => expect(result.current.editing).toBeNull())
    expect(api.update).toHaveBeenCalledWith(1, { name: 'Uno' })
    expect(toast.success).toHaveBeenCalledWith(i18n.t('toast.saved'))
  })

  it('keeps the editor open when saving fails', async () => {
    api.create.mockRejectedValue(new Error('taken'))
    const { result } = setup()
    act(() => result.current.setEditing('new'))
    act(() => result.current.save({ name: 'X' }))
    await waitFor(() => expect(result.current.saving).toBe(false))
    expect(api.create).toHaveBeenCalled()
    expect(result.current.editing).toBe('new')
    expect(toast.success).not.toHaveBeenCalled()
  })
})

describe('useCrud deleting', () => {
  it('deletes the row awaiting confirmation', async () => {
    const { result } = setup()
    await waitFor(() => expect(result.current.rows).toHaveLength(1))
    act(() => result.current.setDeleting(result.current.rows[0]))
    act(() => result.current.confirmDelete())
    await waitFor(() => expect(result.current.deleting).toBeNull())
    expect(api.remove).toHaveBeenCalledWith(1)
    expect(toast.success).toHaveBeenCalledWith(i18n.t('toast.deleted'))
  })

  it('clears the confirmation even when deleting fails', async () => {
    api.remove.mockRejectedValue(new Error('nope'))
    const { result } = setup()
    act(() => result.current.setDeleting({ id: 9, name: 'Nine' }))
    act(() => result.current.confirmDelete())
    await waitFor(() => expect(result.current.deleting).toBeNull())
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('confirmDelete does nothing without a pending row', () => {
    const { result } = setup()
    act(() => result.current.confirmDelete())
    expect(api.remove).not.toHaveBeenCalled()
  })
})
