import { useTranslation } from 'react-i18next'
import { tLabel } from '../../i18n/index'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminService } from '../../services/admin'
import { toExerciseForm } from '../../services/exercises'
import type { Exercise, ExerciseForm } from '../../types/exercises'
import { adminExerciseSchema, type AdminExerciseValues } from '../../schemas/admin-exercise.schema'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import { useCrud } from '../../hooks/useCrud'
import { useTaxonomies } from '../../hooks/useTaxonomies'

const difficultyStars: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }

const blankExercise: AdminExerciseValues = {
  name: '',
  description: '',
  instructions: '',
  muscleGroups: [],
  equipmentList: [],
  difficulty: 'Beginner',
  category: 'Strength',
  primaryMuscles: '',
  videoUrl: '',
  thumbnailUrl: '',
}

export default function AdminExercises() {
  const { t } = useTranslation()
  const [category, setCategory] = useState('')
  const taxonomies = useTaxonomies()

  const crud = useCrud<Exercise, ExerciseForm>(adminService.exercises, { resource: 'exercises', defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { category } })
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<AdminExerciseValues>({
    resolver: zodResolver(adminExerciseSchema),
    mode: 'onTouched',
    defaultValues: blankExercise,
  })

  useEffect(() => {
    if (!crud.editing) return
    reset(crud.editingRow ? toExerciseForm(crud.editingRow) : blankExercise)
  }, [crud.editing, crud.editingRow, reset])

  // One toggler for both chip rows -- they behave identically.
  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

  const submit = handleSubmit((values) => crud.save(values))

  const columns: Column<Exercise>[] = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md font-medium">
          <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
            <Icon name={row.icon} />
          </span>
          {row.name}
        </span>
      ),
    },
    {
      key: 'muscleGroups',
      header: t('admin.exercises.muscleGroups'),
      className: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
      render: (row) => (
        <span className="flex flex-wrap gap-1">
          {row.muscleGroups.map((group, index) => (
            <span
              key={group}
              className={`px-2 py-0.5 rounded text-xs ${
                index === 0
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {tLabel(group)}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: 'equipment',
      header: t('common.equipment'),
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => tLabel(row.equipment),
    },
    {
      key: 'difficulty',
      header: t('common.difficulty'),
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-primary" title={tLabel(row.difficulty)}>
          {[1, 2, 3].map((n) => (
            <Icon key={n} name="star" size={16} filled={n <= (difficultyStars[row.difficulty] ?? 0)} />
          ))}
        </span>
      ),
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
        title={t('admin.exercises.manageExercises')}
        description={t('admin.exercises.viewEditAndCreateExerciseData')}
        actionLabel={t('admin.exercises.addNewExercise')}
        onAction={() => crud.setEditing('new')}
      />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder={t('common.searchExercises')}>
        <AdminSelect
          label={t('common.category')}
          value={category}
          onChange={setCategory}
          options={[{ value: '', label: t('common.all') }, ...(taxonomies?.categories ?? [])]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label={t('admin.exercises.loadingExercises')} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty={t('admin.exercises.noExercisesMatchYourSearch')}
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {t('admin.exercises.showingOfExercises', { shown: crud.rows.length, total: crud.meta?.total ?? crud.rows.length })}
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editingRow ? t('admin.exercises.editExercise') : t('admin.exercises.addNewExercise')}
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField label={t('common.name')} id="name" error={errors.name?.message} {...register('name')} />
          <TextAreaField label={t('common.description')} id="description" error={errors.description?.message} {...register('description')} />

          <div>
            <span className="block font-label-bold text-label-bold text-on-surface mb-xs">{t('admin.exercises.muscleGroups2')}</span>
            <Controller
              control={control}
              name="muscleGroups"
              render={({ field }) => (
            <div className="flex flex-wrap gap-sm">
              {(taxonomies?.muscleGroups ?? []).map((group, index) => {
                const active = field.value.includes(group.label)
                return (
                  <button
                    key={group.value}
                    ref={index === 0 ? field.ref : undefined}
                    type="button"
                    aria-pressed={active}
                    onClick={() => field.onChange(toggle(field.value, group.label))}
                    className={`px-sm py-xs rounded-full border font-label-sm text-label-sm transition-colors ${
                      active
                        ? 'border-primary bg-primary-container/10 text-primary'
                        : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
                    }`}
                  >
                    {tLabel(group.label)}</button>
                )
              })}
            </div>
              )}
            />
            {errors.muscleGroups ? (
              <p className="font-label-sm text-label-sm text-error mt-xs">{errors.muscleGroups.message}</p>
            ) : null}
          </div>

          <div>
            <span className="block font-label-bold text-label-bold text-on-surface mb-xs">{t('common.equipment')}</span>
            <Controller
              control={control}
              name="equipmentList"
              render={({ field }) => (
            <div className="flex flex-wrap gap-sm">
              {(taxonomies?.equipment ?? []).map((option) => {
                const active = field.value.includes(option.label)
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => field.onChange(toggle(field.value, option.label))}
                    className={`px-sm py-xs rounded-full border font-label-sm text-label-sm transition-colors ${
                      active
                        ? 'border-primary bg-primary-container/10 text-primary'
                        : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
                    }`}
                  >
                    {tLabel(option.label)}</button>
                )
              })}
            </div>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <SelectField label={t('common.difficulty')} id="difficulty" error={errors.difficulty?.message} {...register('difficulty')}>
              {(taxonomies?.difficulties ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {tLabel(option.label)}</option>
              ))}
            </SelectField>
            <SelectField label={t('common.category')} id="category" error={errors.category?.message} {...register('category')}>
              {(taxonomies?.categories ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {tLabel(option.label)}</option>
              ))}
            </SelectField>
          </div>

          <TextField
            label={t('admin.exercises.primaryMuscles')}
            id="primaryMuscles"
            {...register('primaryMuscles')}
            placeholder={t('admin.exercises.chestTricepsMustBeAmongThe')}
          />

          <TextAreaField
            label={t('admin.exercises.instructionsOneStepPerLine')}
            id="instructions"
            {...register('instructions')}
            rows={5}
            placeholder={t('admin.exercises.instructionsPlaceholder')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <TextField
              label={t('admin.exercises.videoUrl')}
              id="videoUrl"
              type="url"
              error={errors.videoUrl?.message}
              {...register('videoUrl')}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <TextField
              label={t('admin.exercises.thumbnailUrl')}
              id="thumbnailUrl"
              type="url"
              error={errors.thumbnailUrl?.message}
              {...register('thumbnailUrl')}
              placeholder="https://i.ytimg.com/vi/<id>/hqdefault.jpg"
            />
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
