import { useTranslation } from 'react-i18next'
import i18n, { tLabel } from '../../i18n/index'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { errorMessage } from '../../services/http'
import { adminService } from '../../services/admin'
import type { AdminUser, UserForm } from '../../types/admin'
import { adminUserSchema, type AdminUserValues } from '../../schemas/admin-user.schema'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import { useCrud } from '../../hooks/useCrud'

const blankUser: AdminUserValues = { name: '', email: '', role: 'Member', status: 'Active' }

const statusTone: Record<string, string> = {
  Active: 'bg-primary-fixed text-on-primary-fixed-variant',
  Suspended: 'bg-error-container text-on-error-container',
}

const roleTone: Record<string, string> = {
  Admin: 'bg-tertiary-container text-on-tertiary-container',
  Member: 'bg-surface-container text-on-surface-variant',
}

export default function AdminUsers() {
  const { t } = useTranslation()
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const crud = useCrud<AdminUser, UserForm>(adminService.users, { resource: 'users', defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { role, status } })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminUserValues>({
    resolver: zodResolver(adminUserSchema),
    mode: 'onTouched',
    defaultValues: blankUser,
  })

  useEffect(() => {
    if (!crud.editing) return
    const row = crud.editingRow
    reset(
      row
        ? { name: row.name, email: row.email, role: row.role as AdminUserValues['role'], status: row.status as AdminUserValues['status'] }
        : blankUser,
    )
  }, [crud.editing, crud.editingRow, reset])

  const submit = handleSubmit((values) => crud.save(values))

  // Dedicated endpoint rather than a full update: it flips the flag server-side
  // and refuses to let an admin deactivate their own account.
  const toggleStatus = async (row: AdminUser) => {
    try {
      await adminService.users.toggleActive(row.id)
      await crud.refetch()
      toast.success(i18n.t('toast.statusUpdated'))
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md">
          <span className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center font-label-bold text-label-bold shrink-0">
            {row.name.charAt(0)}
          </span>
          <span className="font-medium text-on-surface">{row.name}</span>
        </span>
      ),
    },
    {
      key: 'email',
      header: t('common.email'),
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.email,
    },
    {
      key: 'role',
      header: t('admin.users.role'),
      sortable: true,
      render: (row) => (
        <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm ${roleTone[row.role] ?? roleTone.Member}`}>
          {tLabel(row.role)}
        </span>
      ),
    },
    {
      key: 'joined',
      header: t('admin.users.joinedDate'),
      sortable: true,
      className: 'hidden sm:table-cell text-on-surface-variant whitespace-nowrap',
      headerClassName: 'hidden sm:table-cell',
      render: (row) =>
        new Date(row.joined).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: '2-digit' }),
    },
    {
      key: 'status',
      header: t('common.status'),
      sortable: true,
      render: (row) => (
        <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm ${statusTone[row.status]}`}>
          {tLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <span className="flex justify-end items-center">
          <button
            type="button"
            onClick={() => toggleStatus(row)}
            aria-label={row.status === 'Suspended' ? t('admin.users.reinstate2', { name: row.name }) : t('admin.users.suspend2', { name: row.name })}
            title={row.status === 'Suspended' ? t('admin.users.reinstate') : t('admin.users.suspend')}
            className="p-xs text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
          >
            <Icon name={row.status === 'Suspended' ? 'circle-check' : 'ban'} size={20} />
          </button>
          <RowActions onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />
        </span>
      ),
    },
  ]

  return (
    <>
      <AdminHeader
        title={t('admin.users.userManagement')}
        description={t('admin.users.viewAndManageAllRegisteredAccounts')}
        actionLabel={t('admin.users.addUser')}
        onAction={() => crud.setEditing('new')}
      />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder={t('admin.users.searchByNameOrEmail')}>
        <AdminSelect
          label={t('admin.users.role')}
          value={role}
          onChange={setRole}
          options={[
            { value: '', label: t('admin.users.allRoles') },
            { value: 'admin', label: t('common.admin') },
            { value: 'member', label: t('common.member') },
          ]}
        />
        <AdminSelect
          label={t('common.status')}
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: t('common.allStatus') },
            { value: 'active', label: t('admin.users.active') },
            { value: 'suspended', label: t('admin.users.suspended') },
          ]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label={t('admin.users.loadingUsers')} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty={t('admin.users.noUsersMatchThoseFilters')}
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {t('admin.users.showingOfEntries', { shown: crud.rows.length, total: crud.meta?.total ?? crud.rows.length })}
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editingRow ? t('admin.users.editUser') : t('admin.users.addUser')}
        description={crud.editingRow ? undefined : t('admin.users.theyCanSetTheirOwnPassword')}
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
        size="sm"
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField label={t('common.name')} id="name" error={errors.name?.message} {...register('name')} />
          <TextField label={t('common.email')} id="email" type="email" error={errors.email?.message} {...register('email')} />
          <div className="grid grid-cols-2 gap-md">
            <SelectField label={t('admin.users.role')} id="role" {...register('role')}>
              <option value="Member">{t('common.member')}</option>
              <option value="Admin">{t('common.admin')}</option>
            </SelectField>
            <SelectField label={t('common.status')} id="status" {...register('status')}>
              <option value="Active">{t('admin.users.active')}</option>
              <option value="Suspended">{t('admin.users.suspended')}</option>
            </SelectField>
          </div>
        </form>
      </Modal>

      <DeleteDialog
        row={crud.deleting}
        label={crud.deleting?.name}
        onCancel={() => crud.setDeleting(null)}
        onConfirm={crud.confirmDelete}
      />
    </>
  )
}
