import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import i18n from '../../i18n'
import { renderWithProviders } from '../../test/utils'
import type { AdminUser } from '../../types/admin'
import AdminUsers from './AdminUsers'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../services/admin', () => ({
  adminService: { users: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), toggleActive: vi.fn() } },
}))

const { adminService } = await import('../../services/admin')
const api = vi.mocked(adminService.users)
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

const ada: AdminUser = { id: 1, name: 'Ada', email: 'ada@example.com', role: 'Admin', status: 'Active', joined: '2024-03-15' }
const bo: AdminUser = { id: 2, name: 'Bo', email: 'bo@example.com', role: 'Member', status: 'Suspended', joined: '2024-04-01' }

beforeEach(() => {
  api.list.mockReset().mockResolvedValue({ data: [ada, bo], meta: { total: 2, page: 1, perPage: 15, lastPage: 1 } })
  for (const fn of [api.create, api.update, api.remove, api.toggleActive]) fn.mockReset().mockResolvedValue({} as never)
  vi.mocked(toast.success).mockClear()
  vi.mocked(toast.error).mockClear()
})

const rowFor = (name: string) => screen.getByRole('cell', { name: new RegExp(`^${name.charAt(0)}${name}$`) }).closest('tr')!

describe('AdminUsers', () => {
  it('lists users sorted by name, with role and status', async () => {
    renderWithProviders(<AdminUsers />)
    expect(screen.getByRole('status')).toHaveTextContent(t('admin.users.loadingUsers'))
    const ada = await screen.findByText('ada@example.com')
    expect(ada.closest('tr')).toHaveTextContent('Admin')
    expect(rowFor('Bo')).toHaveTextContent('Suspended')
    expect(screen.getByText(t('admin.users.showingOfEntries', { shown: 2, total: 2 }))).toBeInTheDocument()
    expect(api.list).toHaveBeenCalledWith(
      { search: '', sort: 'name', dir: 'asc', page: 1, role: '', status: '' },
      expect.any(AbortSignal),
    )
  })

  it('filters by role and status', async () => {
    renderWithProviders(<AdminUsers />)
    await screen.findByText('ada@example.com')
    await userEvent.selectOptions(screen.getByLabelText(t('admin.users.role')), 'admin')
    await userEvent.selectOptions(screen.getByLabelText(t('common.status')), 'suspended')
    await waitFor(() =>
      expect(api.list).toHaveBeenLastCalledWith(expect.objectContaining({ role: 'admin', status: 'suspended' }), expect.anything()),
    )
  })

  it('adds a user', async () => {
    renderWithProviders(<AdminUsers />)
    await screen.findByText('ada@example.com')
    await userEvent.click(screen.getByRole('button', { name: t('admin.users.addUser') }))
    const dialog = screen.getByRole('dialog', { name: t('admin.users.addUser') })

    await userEvent.click(within(dialog).getByRole('button', { name: t('admin.shared.save') }))
    expect(await within(dialog).findByText(t('common.nameIsRequired'))).toBeInTheDocument()
    expect(api.create).not.toHaveBeenCalled()

    await userEvent.type(within(dialog).getByLabelText(t('common.name')), 'Cy')
    await userEvent.type(within(dialog).getByLabelText(t('common.email')), 'cy@example.com')
    await userEvent.selectOptions(within(dialog).getByLabelText(t('admin.users.role')), 'Admin')
    await userEvent.click(within(dialog).getByRole('button', { name: t('admin.shared.save') }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(api.create).toHaveBeenCalledWith({ name: 'Cy', email: 'cy@example.com', role: 'Admin', status: 'Active' })
    expect(toast.success).toHaveBeenCalledWith(t('toast.created'))
  })

  it('edits a user with the form pre-filled', async () => {
    renderWithProviders(<AdminUsers />)
    await screen.findByText('ada@example.com')
    await userEvent.click(within(rowFor('Bo')).getByRole('button', { name: t('ui.edit') }))
    const dialog = screen.getByRole('dialog', { name: t('admin.users.editUser') })
    expect(within(dialog).getByLabelText(t('common.email'))).toHaveValue('bo@example.com')
    expect(within(dialog).getByLabelText(t('common.status'))).toHaveValue('Suspended')

    await userEvent.selectOptions(within(dialog).getByLabelText(t('common.status')), 'Active')
    await userEvent.click(within(dialog).getByRole('button', { name: t('admin.shared.save') }))
    await waitFor(() => expect(api.update).toHaveBeenCalledWith(2, { name: 'Bo', email: 'bo@example.com', role: 'Member', status: 'Active' }))
  })

  it('cancels editing', async () => {
    renderWithProviders(<AdminUsers />)
    await screen.findByText('ada@example.com')
    await userEvent.click(screen.getByRole('button', { name: t('admin.users.addUser') }))
    await userEvent.click(screen.getByRole('button', { name: t('admin.shared.cancel') }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('deletes a user after confirmation', async () => {
    renderWithProviders(<AdminUsers />)
    await screen.findByText('ada@example.com')
    await userEvent.click(within(rowFor('Ada')).getByRole('button', { name: t('common.delete') }))
    const dialog = screen.getByRole('dialog', { name: t('admin.shared.deleteThisRecord') })
    expect(dialog).toHaveTextContent('Ada')
    await userEvent.click(within(dialog).getByRole('button', { name: t('common.delete') }))
    await waitFor(() => expect(api.remove).toHaveBeenCalledWith(1))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('suspends and reinstates users', async () => {
    renderWithProviders(<AdminUsers />)
    await screen.findByText('ada@example.com')
    await userEvent.click(screen.getByRole('button', { name: t('admin.users.suspend2', { name: 'Ada' }) }))
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(t('toast.statusUpdated')))
    expect(api.toggleActive).toHaveBeenCalledWith(1)
    expect(api.list).toHaveBeenCalledTimes(2)

    api.toggleActive.mockRejectedValue(new Error('You cannot deactivate yourself'))
    await userEvent.click(screen.getByRole('button', { name: t('admin.users.reinstate2', { name: 'Bo' }) }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('You cannot deactivate yourself'))
  })

  it('shows an empty message and list errors', async () => {
    api.list.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, perPage: 15, lastPage: 1 } })
    const { unmount } = renderWithProviders(<AdminUsers />)
    expect(await screen.findByText(t('admin.users.noUsersMatchThoseFilters'))).toBeInTheDocument()
    unmount()

    api.list.mockRejectedValueOnce(new Error('Forbidden'))
    renderWithProviders(<AdminUsers />)
    expect(await screen.findByText('Forbidden')).toBeInTheDocument()
  })
})
