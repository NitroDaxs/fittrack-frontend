import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { adminService } from '../../services/admin'
import { toExerciseForm } from '../../services/exercises'
import type { Exercise, ExerciseForm } from '../../types/exercises'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter, Notice } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import { useCrud } from '../../hooks/useCrud'
import { useTaxonomies } from '../../hooks/useTaxonomies'

const difficultyStars: Record<string, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 }

type FormErrors = Partial<Record<keyof ExerciseForm, string>>

const blankExercise: ExerciseForm = {
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
  const [category, setCategory] = useState('')
  const taxonomies = useTaxonomies()

  const crud = useCrud<Exercise, ExerciseForm>(adminService.exercises, { resource: 'exercises', defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { category } })
  const [form, setForm] = useState<ExerciseForm>(blankExercise)
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!crud.editing) return
    setForm(crud.editingRow ? toExerciseForm(crud.editingRow) : blankExercise)
    setErrors({})
  }, [crud.editing, crud.editingRow])

  const setField = (name: keyof ExerciseForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [name]: event.target.value }))

  // One toggler for both chip rows -- they behave identically.
  const toggleIn = (key: 'muscleGroups' | 'equipmentList') => (value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((item) => item !== value) : [...f[key], value],
    }))

  const toggleMuscle = toggleIn('muscleGroups')
  const toggleEquipment = toggleIn('equipmentList')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found: FormErrors = {}
    if (!form.name.trim()) found.name = 'Name is required.'
    if (!form.description.trim()) found.description = 'Give it a one-line description.'
    if (form.muscleGroups.length === 0) found.muscleGroups = 'Pick at least one muscle group.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save(form)
  }

  const columns: Column<Exercise>[] = [
    {
      key: 'name',
      header: 'Name',
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
      header: 'Muscle Groups',
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
              {group}
            </span>
          ))}
        </span>
      ),
    },
    {
      key: 'equipment',
      header: 'Equipment',
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.equipment,
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-primary" title={row.difficulty}>
          {[1, 2, 3].map((n) => (
            <Icon key={n} name="star" size={16} filled={n <= (difficultyStars[row.difficulty] ?? 0)} />
          ))}
        </span>
      ),
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
        title="Manage Exercises"
        description="View, edit, and create exercise data for the global library."
        actionLabel="Add new exercise"
        onAction={() => crud.setEditing('new')}
      />

      <Notice notice={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search exercises...">
        <AdminSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={[{ value: '', label: 'All' }, ...(taxonomies?.categories ?? [])]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label="Loading exercises" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty="No exercises match your search."
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {crud.rows.length} of {crud.meta?.total ?? crud.rows.length} exercises
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editingRow ? 'Edit exercise' : 'Add new exercise'}
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          {crud.saveError ? <Notice notice={{ message: crud.saveError, tone: 'error' }} /> : null}
          <TextField label="Name" name="name" value={form.name} onChange={setField('name')} error={errors.name ?? crud.fieldErrors.name} />
          <TextAreaField
            label="Description"
            name="description"
            value={form.description}
            onChange={setField('description')}
            error={errors.description ?? crud.fieldErrors.description}
          />

          <div>
            <span className="block font-label-bold text-label-bold text-on-surface mb-xs">Muscle groups</span>
            <div className="flex flex-wrap gap-sm">
              {(taxonomies?.muscleGroups ?? []).map((group) => {
                const active = form.muscleGroups.includes(group.label)
                return (
                  <button
                    key={group.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleMuscle(group.label)}
                    className={`px-sm py-xs rounded-full border font-label-sm text-label-sm transition-colors ${
                      active
                        ? 'border-primary bg-primary-container/10 text-primary'
                        : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
                    }`}
                  >
                    {group.label}
                  </button>
                )
              })}
            </div>
            {errors.muscleGroups ? (
              <p className="font-label-sm text-label-sm text-error mt-xs">{errors.muscleGroups}</p>
            ) : null}
          </div>

          <div>
            <span className="block font-label-bold text-label-bold text-on-surface mb-xs">Equipment</span>
            <div className="flex flex-wrap gap-sm">
              {(taxonomies?.equipment ?? []).map((option) => {
                const active = form.equipmentList.includes(option.label)
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleEquipment(option.label)}
                    className={`px-sm py-xs rounded-full border font-label-sm text-label-sm transition-colors ${
                      active
                        ? 'border-primary bg-primary-container/10 text-primary'
                        : 'border-surface-variant bg-surface text-secondary hover:border-primary/50'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <SelectField label="Difficulty" name="difficulty" value={form.difficulty} onChange={setField('difficulty')}>
              {(taxonomies?.difficulties ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField label="Category" name="category" value={form.category} onChange={setField('category')}>
              {(taxonomies?.categories ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>

          <TextField
            label="Primary muscles"
            name="primaryMuscles"
            value={form.primaryMuscles}
            onChange={setField('primaryMuscles')}
            placeholder="Chest, Triceps — must be among the groups selected above"
          />

          <TextAreaField
            label="Instructions — one step per line"
            name="instructions"
            value={form.instructions}
            onChange={setField('instructions')}
            rows={5}
            placeholder={'Lie flat with your eyes under the bar.\nGrip slightly wider than shoulder-width.'}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <TextField
              label="Video URL"
              name="videoUrl"
              type="url"
              value={form.videoUrl}
              onChange={setField('videoUrl')}
              error={crud.fieldErrors.video_url}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <TextField
              label="Thumbnail URL"
              name="thumbnailUrl"
              type="url"
              value={form.thumbnailUrl}
              onChange={setField('thumbnailUrl')}
              error={crud.fieldErrors.thumbnail_url}
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
