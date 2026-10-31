import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { adminService } from '../../services/admin'
import type { Routine, RoutineForm } from '../../types/routines'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter, Notice } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import RoutineDayBuilder from '../../components/admin/RoutineDayBuilder'
import { useCrud } from '../../hooks/useCrud'
import { useTaxonomies } from '../../hooks/useTaxonomies'

type FormErrors = Partial<Record<keyof RoutineForm, string>>

const blankRoutine: RoutineForm = {
  title: '',
  description: '',
  goal: 'Strength',
  level: 'Beginner',
  daysPerWeek: 3,
  isPublic: true,
  days: [],
}

const goalTone: Record<string, string> = {
  Strength: 'bg-tertiary-container text-on-tertiary-container',
  Hypertrophy: 'bg-secondary-container text-on-secondary-container',
  'Fat Loss': 'bg-primary-container text-on-primary',
  Endurance: 'bg-surface-container-high text-on-surface-variant',
  'General Fitness': 'bg-surface-container-high text-on-surface-variant',
}

export default function AdminRoutines() {
  const [goal, setGoal] = useState('')
  const taxonomies = useTaxonomies()

  const crud = useCrud<Routine, RoutineForm>(adminService.routines, {
    resource: 'routines',
    defaultSort: { key: 'title', dir: 'asc' },
    extraQuery: { goal },
  })

  const [form, setForm] = useState<RoutineForm>(blankRoutine)
  const [errors, setErrors] = useState<FormErrors>({})

  // The table row carries only metadata, so the programme is fetched separately
  // when an existing routine is opened. New routines start with no days.
  useEffect(() => {
    if (!crud.editing) return

    const row = crud.editingRow
    setForm(
      row
        ? {
            title: row.title,
            description: row.description,
            goal: row.goal,
            level: row.level,
            daysPerWeek: row.daysPerWeek,
            isPublic: row.isPublic,
            days: [],
          }
        : blankRoutine,
    )
    setErrors({})

    if (!row) return undefined

    let cancelled = false
    adminService.routines
      .programme(row.id)
      .then((days) => {
        if (!cancelled) setForm((f) => ({ ...f, days }))
      })
      .catch(() => {
        // Leave days empty -- saving without touching them won't wipe the
        // programme, because the payload omits `days` when it's untouched.
      })

    return () => {
      cancelled = true
    }
  }, [crud.editing, crud.editingRow])

  const setField = (name: keyof RoutineForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [name]: event.target.value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found: FormErrors = {}
    if (!form.title.trim()) found.title = 'Title is required.'
    if (!form.description.trim()) found.description = 'Describe the programme in a sentence.'
    if (Number(form.daysPerWeek) < 1 || Number(form.daysPerWeek) > 7) found.daysPerWeek = 'Between 1 and 7.'
    // A day with no exercises would publish as an empty block on the routine page.
    const emptyDay = form.days.findIndex((day) => day.exercises.length === 0)
    if (emptyDay !== -1) {
      found.days = `"${form.days[emptyDay].name || `Day ${emptyDay + 1}`}" has no exercises.`
    }
    setErrors(found)
    if (Object.keys(found).length > 0) return

    crud.save(form)
  }

  const columns: Column<Routine>[] = [
    {
      key: 'title',
      header: 'Routine Title',
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md">
          <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
            <Icon name={row.icon} />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-on-surface truncate">{row.title}</span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">
              {row.goal} • {row.level} • {row.daysPerWeek} Days
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'goal',
      header: 'Goal',
      sortable: true,
      className: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
      render: (row) => (
        <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm ${goalTone[row.goal] ?? 'bg-surface-container text-secondary'}`}>
          {row.goal}
        </span>
      ),
    },
    {
      key: 'level',
      header: 'Difficulty',
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.level,
    },
    {
      key: 'daysPerWeek',
      header: 'Days/Week',
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.daysPerWeek,
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => <RowActions onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />,
    },
  ]

  return (
    <>
      <AdminHeader
        title="Manage Routines"
        description="Create, edit, and organize workout templates for users."
        actionLabel="Add new routine"
        onAction={() => crud.setEditing('new')}
      />

      <Notice notice={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search routines...">
        <AdminSelect
          label="Goal"
          value={goal}
          onChange={setGoal}
          options={[{ value: '', label: 'All Goals' }, ...(taxonomies?.goals ?? [])]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label="Loading routines" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty="No routines match your search."
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {crud.rows.length} of {crud.meta?.total ?? crud.rows.length} routines
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editingRow ? 'Edit routine' : 'Add new routine'}
        description="Metadata plus the day-by-day programme. Everything saves together."
        onClose={() => crud.setEditing(null)}
        size="lg"
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          {crud.saveError ? <Notice notice={{ message: crud.saveError, tone: 'error' }} /> : null}
          <TextField label="Title" name="title" value={form.title} onChange={setField('title')} error={errors.title ?? crud.fieldErrors.title} />
          <TextAreaField
            label="Description"
            name="description"
            value={form.description}
            onChange={setField('description')}
            error={errors.description}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <SelectField label="Goal" name="goal" value={form.goal} onChange={setField('goal')}>
              {(taxonomies?.goals ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField label="Level" name="level" value={form.level} onChange={setField('level')}>
              {(taxonomies?.levels ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <TextField
              label="Days per week"
              name="daysPerWeek"
              type="number"
              min="1"
              max="7"
              value={form.daysPerWeek}
              onChange={setField('daysPerWeek')}
              error={errors.daysPerWeek ?? crud.fieldErrors.days_per_week}
            />
          </div>

          {errors.days ?? crud.fieldErrors.days ? (
            <p className="font-label-sm text-label-sm text-error">{errors.days ?? crud.fieldErrors.days}</p>
          ) : null}

          <RoutineDayBuilder
            days={form.days}
            daysPerWeek={form.daysPerWeek}
            onChange={(days) => setForm((f) => ({ ...f, days }))}
          />
        </form>
      </Modal>

      <DeleteDialog
        row={crud.deleting}
        label={crud.deleting?.title}
        onCancel={() => crud.setDeleting(null)}
        onConfirm={crud.confirmDelete}
      />
    </>
  )
}
