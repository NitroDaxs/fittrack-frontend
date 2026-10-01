import { useEffect, useState } from 'react'
import { adminApi } from '../../api/resources'
import { useCrud } from '../../components/admin/useCrud'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter, Notice } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextField } from '../../components/ui/Field'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'

const blankUser = { name: '', email: '', role: 'Member', status: 'Active', joined: new Date().toISOString().slice(0, 10) }

const statusTone = {
  Active: 'bg-primary-fixed text-on-primary-fixed-variant',
  Suspended: 'bg-error-container text-on-error-container',
  Inactive: 'bg-surface-container text-on-surface-variant',
}

const roleTone = {
  Admin: 'bg-tertiary-container text-on-tertiary-container',
  Editor: 'bg-secondary-container text-on-secondary-container',
  Member: 'bg-surface-container text-on-surface-variant',
}

export default function AdminUsers() {
  const [role, setRole] = useState('All Roles')
  const [status, setStatus] = useState('All Status')

  const crud = useCrud(adminApi.users, { defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { role, status } })

  const [form, setForm] = useState(blankUser)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (crud.editing) {
      setForm({ ...blankUser, ...crud.editing })
      setErrors({})
    }
  }, [crud.editing])

  const setField = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    const found = {}
    if (!form.name.trim()) found.name = 'Name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) found.email = 'Enter a valid email address.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save(form)
  }

  // Dedicated endpoint rather than a full update: it flips the flag server-side
  // and refuses to let an admin deactivate their own account.
  const toggleStatus = async (row) => {
    await adminApi.users.toggleActive(row.id)
    crud.refetch()
  }

  const columns = [
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
        onAction={() => crud.setEditing({})}
      />

      <Notice message={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search by name or email...">
        <AdminSelect label="Role" value={role} onChange={setRole} options={['All Roles', 'Admin', 'Editor', 'Member']} />
        <AdminSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={['All Status', 'Active', 'Suspended', 'Inactive']}
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
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editing?.id ? 'Edit user' : 'Add user'}
        description="Roles and status update the local demo state only."
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
        size="sm"
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField label="Name" name="name" value={form.name} onChange={setField('name')} error={errors.name} />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
          />
          <div className="grid grid-cols-2 gap-md">
            <SelectField label="Role" name="role" value={form.role} onChange={setField('role')}>
              {/* The UserRole enum only has member and admin; "Editor" was a
                  mock leftover and the API 422s on it. */}
              <option>Member</option>
              <option>Admin</option>
            </SelectField>
            <SelectField label="Status" name="status" value={form.status} onChange={setField('status')}>
              <option>Active</option>
              <option>Suspended</option>
              <option>Inactive</option>
            </SelectField>
          </div>
          <TextField label="Joined" name="joined" type="date" value={form.joined} onChange={setField('joined')} />
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
