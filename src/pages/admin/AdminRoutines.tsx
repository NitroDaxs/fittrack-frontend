import { useTranslation } from 'react-i18next'
import { tLabel } from '../../i18n/index'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminService } from '../../services/admin'
import type { Routine, RoutineForm } from '../../types/routines'
import { adminRoutineSchema, type AdminRoutineInput, type AdminRoutineValues } from '../../schemas/admin-routine.schema'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import RoutineDayBuilder from '../../components/admin/RoutineDayBuilder'
import { useCrud } from '../../hooks/useCrud'
import { useTaxonomies } from '../../hooks/useTaxonomies'

const blankRoutine: AdminRoutineInput = {
  title: '',
  description: '',
  goal: 'Strength',
  level: 'Beginner',
  daysPerWeek: '3',
  isPublic: true,
  imageUrl: '',
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
  const { t } = useTranslation()
  const [goal, setGoal] = useState('')
  const taxonomies = useTaxonomies()

  const crud = useCrud<Routine, RoutineForm>(adminService.routines, {
    resource: 'routines',
    defaultSort: { key: 'title', dir: 'asc' },
    extraQuery: { goal },
  })

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<AdminRoutineInput, unknown, AdminRoutineValues>({
    resolver: zodResolver(adminRoutineSchema),
    mode: 'onTouched',
    defaultValues: blankRoutine,
  })
  const daysPerWeek = watch('daysPerWeek')

  // The table row carries only metadata, so the programme is fetched separately
  // when an existing routine is opened. New routines start with no days.
  useEffect(() => {
    if (!crud.editing) return

    const row = crud.editingRow
    reset(
      row
        ? {
            title: row.title,
            description: row.description,
            goal: row.goal,
            level: row.level,
            daysPerWeek: String(row.daysPerWeek),
            isPublic: row.isPublic,
            imageUrl: row.image ?? '',
            days: [],
          }
        : blankRoutine,
    )

    if (!row) return undefined

    let cancelled = false
    adminService.routines
      .programme(row.id)
      .then((days) => {
        if (!cancelled) setValue('days', days)
      })
      .catch(() => {
        // Leave days empty -- saving without touching them won't wipe the
        // programme, because the payload omits `days` when it's untouched.
      })

    return () => {
      cancelled = true
    }
  }, [crud.editing, crud.editingRow, reset, setValue])

  const submit = handleSubmit((values) => crud.save(values))

  const columns: Column<Routine>[] = [
    {
      key: 'title',
      header: t('admin.routines.routineTitle'),
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md">
          <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
            <Icon name={row.icon} />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-on-surface truncate">{row.title}</span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">
              {t('admin.routines.days', { goal: tLabel(row.goal), level: tLabel(row.level), days: row.daysPerWeek })}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'goal',
      header: t('common.goal'),
      sortable: true,
      className: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
      render: (row) => (
        <span className={`px-sm py-xs rounded-full font-label-sm text-label-sm ${goalTone[row.goal] ?? 'bg-surface-container text-secondary'}`}>
          {tLabel(row.goal)}
        </span>
      ),
    },
    {
      key: 'level',
      header: t('common.difficulty'),
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => tLabel(row.level),
    },
    {
      key: 'daysPerWeek',
      header: t('common.daysWeek'),
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.daysPerWeek,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => <RowActions onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />,
    },
  ]

  return (
    <>
      <AdminHeader
        title={t('admin.routines.manageRoutines')}
        description={t('admin.routines.createEditAndOrganizeWorkoutTemplates')}
        actionLabel={t('admin.routines.addNewRoutine')}
        onAction={() => crud.setEditing('new')}
      />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder={t('common.searchRoutines')}>
        <AdminSelect
          label={t('common.goal')}
          value={goal}
          onChange={setGoal}
          options={[{ value: '', label: t('admin.routines.allGoals') }, ...(taxonomies?.goals ?? [])]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label={t('admin.routines.loadingRoutines')} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty={t('admin.routines.noRoutinesMatchYourSearch')}
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {t('admin.routines.showingOfRoutines', { shown: crud.rows.length, total: crud.meta?.total ?? crud.rows.length })}
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editingRow ? t('admin.routines.editRoutine') : t('admin.routines.addNewRoutine')}
        description={t('admin.routines.metadataPlusTheDayByDay')}
        onClose={() => crud.setEditing(null)}
        size="lg"
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField label={t('common.title')} id="title" error={errors.title?.message} {...register('title')} />
          <TextAreaField label={t('common.description')} id="description" error={errors.description?.message} {...register('description')} />
          <TextField
            label={t('admin.routines.imageUrl')}
            id="imageUrl"
            type="url"
            error={errors.imageUrl?.message}
            placeholder="https://images.unsplash.com/photo-..."
            {...register('imageUrl')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <SelectField label={t('common.goal')} id="goal" error={errors.goal?.message} {...register('goal')}>
              {(taxonomies?.goals ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {tLabel(option.label)}</option>
              ))}
            </SelectField>
            <SelectField label={t('admin.routines.level')} id="level" error={errors.level?.message} {...register('level')}>
              {(taxonomies?.levels ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {tLabel(option.label)}</option>
              ))}
            </SelectField>
            <TextField
              label={t('admin.routines.daysPerWeek')}
              id="daysPerWeek"
              type="number"
              min="1"
              max="7"
              error={errors.daysPerWeek?.message}
              {...register('daysPerWeek')}
            />
          </div>

          {errors.days?.message ? (
            <p className="font-label-sm text-label-sm text-error">{errors.days.message}</p>
          ) : null}

          <Controller
            control={control}
            name="days"
            render={({ field }) => (
              <RoutineDayBuilder days={field.value} daysPerWeek={daysPerWeek} onChange={field.onChange} />
            )}
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
