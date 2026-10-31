import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { errorMessage } from '../../services/http'
import { adminService } from '../../services/admin'
import type { AdminUser, UserForm } from '../../types/admin'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter, Notice } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import { useCrud } from '../../hooks/useCrud'

type FormErrors = Partial<Record<keyof UserForm, string>>

const blankUser: UserForm = { name: '', email: '', role: 'Member', status: 'Active' }

const statusTone: Record<string, string> = {
  Active: 'bg-primary-fixed text-on-primary-fixed-variant',
  Suspended: 'bg-error-container text-on-error-container',
}

const roleTone: Record<string, string> = {
  Admin: 'bg-tertiary-container text-on-tertiary-container',
  Member: 'bg-surface-container text-on-surface-variant',
}

export default function AdminUsers() {
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  const crud = useCrud<AdminUser, UserForm>(adminService.users, { resource: 'users', defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { role, status } })

  const [form, setForm] = useState<UserForm>(blankUser)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!crud.editing) return
    const row = crud.editingRow
    setForm(row ? { name: row.name, email: row.email, role: row.role, status: row.status } : blankUser)
    setErrors({})
  }, [crud.editing, crud.editingRow])

  const setField = (name: keyof UserForm) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [name]: event.target.value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found: FormErrors = {}
    if (!form.name.trim()) found.name = 'Name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = 'Enter a valid email address.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save(form)
  }

  // Dedicated endpoint rather than a full update: it flips the flag server-side
  // and refuses to let an admin deactivate their own account.
  const toggleStatus = async (row: AdminUser) => {
    try {
      await adminService.users.toggleActive(row.id)
      await crud.refetch()
    } catch (err) {
      crud.flash(errorMessage(err), 'error')
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
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
      header: 'Email',
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.email,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (row) => (
        <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm ${roleTone[row.role] ?? roleTone.Member}`}>
          {row.role}
        </span>
      ),
    },
    {
      key: 'joined',
      header: 'Joined Date',
      sortable: true,
      className: 'hidden sm:table-cell text-on-surface-variant whitespace-nowrap',
      headerClassName: 'hidden sm:table-cell',
      render: (row) =>
        new Date(row.joined).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm ${statusTone[row.status]}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <span className="flex justify-end items-center">
          <button
            type="button"
            onClick={() => toggleStatus(row)}
            aria-label={row.status === 'Suspended' ? `Reinstate ${row.name}` : `Suspend ${row.name}`}
            title={row.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
            className="p-xs text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
          >
            <Icon name={row.status === 'Suspended' ? 'check_circle' : 'block'} size={20} />
          </button>
          <RowActions onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />
        </span>
      ),
    },
  ]

  return (
    <>
      <AdminHeader
        title="User Management"
        description="View and manage all registered accounts in the system."
        actionLabel="Add user"
        onAction={() => crud.setEditing('new')}
      />

      <Notice notice={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search by name or email...">
        <AdminSelect
          label="Role"
          value={role}
          onChange={setRole}
          options={[
            { value: '', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            { value: 'member', label: 'Member' },
          ]}
        />
        <AdminSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'suspended', label: 'Suspended' },
          ]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label="Loading users" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty="No users match those filters."
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {crud.rows.length} of {crud.meta?.total ?? crud.rows.length} entries
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editingRow ? 'Edit user' : 'Add user'}
        description={crud.editingRow ? undefined : 'They can set their own password with "Forgot password?".'}
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
        size="sm"
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          {crud.saveError ? <Notice notice={{ message: crud.saveError, tone: 'error' }} /> : null}
          <TextField label="Name" name="name" value={form.name} onChange={setField('name')} error={errors.name ?? crud.fieldErrors.name} />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email ?? crud.fieldErrors.email}
          />
          <div className="grid grid-cols-2 gap-md">
            <SelectField label="Role" name="role" value={form.role} onChange={setField('role')}>
              <option>Member</option>
              <option>Admin</option>
            </SelectField>
            <SelectField label="Status" name="status" value={form.status} onChange={setField('status')}>
              <option>Active</option>
              <option>Suspended</option>
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
