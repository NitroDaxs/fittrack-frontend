import { useEffect, useState } from 'react'
import { adminApi } from '../../api/resources'
import { useTaxonomies } from '../../context/TaxonomyContext'
import { useCrud } from '../../components/admin/useCrud'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter, Notice } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'

const difficultyStars = { Beginner: 1, Intermediate: 2, Advanced: 3 }

// Mirrors the columns the API actually accepts. `mechanics` and
// `equipmentDetail` were mock-only fields with nowhere to persist, so editing
// them silently did nothing -- dropped rather than left as decoration.
const blankExercise = {
  name: '',
  description: '',
  instructions: '',
  muscleGroups: [],
  // An exercise can use several pieces of equipment ("Barbell, Bench"), so this
  // is a list, not a single select -- the old dropdown silently dropped the rest.
  equipmentList: [],
  difficulty: 'Beginner',
  category: 'Strength',
  primaryMuscles: '',
  video_url: '',
  thumbnail_url: '',
}

export default function AdminExercises() {
  const [category, setCategory] = useState('All')
  const taxonomies = useTaxonomies()

  const crud = useCrud(adminApi.exercises, { defaultSort: { key: 'name', dir: 'asc' }, extraQuery: { category } })
  const [form, setForm] = useState(blankExercise)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (crud.editing) {
      setForm({
        ...blankExercise,
        ...crud.editing,
        // Read side joins equipment names into one string for the table cell;
        // split it back out so the chips can reflect every piece.
        equipmentList: String(crud.editing.equipment ?? '')
          .split(',')
          .map((name) => name.trim())
          .filter(Boolean),
      })
      setErrors({})
    }
  }, [crud.editing])

  const setField = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }))

  // One toggler for both chip rows -- they behave identically.
  const toggleIn = (key) => (value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((item) => item !== value) : [...f[key], value],
    }))

  const toggleMuscle = toggleIn('muscleGroups')
  const toggleEquipment = toggleIn('equipmentList')

  const submit = (event) => {
    event.preventDefault()
    const found = {}
    if (!form.name.trim()) found.name = 'Name is required.'
    if (!form.description.trim()) found.description = 'Give it a one-line description.'
    if (form.muscleGroups.length === 0) found.muscleGroups = 'Pick at least one muscle group.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save(form)
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md font-medium">
          <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
            <Icon name={row.icon ?? 'fitness_center'} />
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
        onAction={() => crud.setEditing({})}
      />

      <Notice message={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search exercises...">
        <AdminSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={['All', 'Strength', 'Cardio', 'Conditioning', 'Core']}
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
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editing?.id ? 'Edit exercise' : 'Add new exercise'}
        description="Changes update the local demo state only."
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField label="Name" name="name" value={form.name} onChange={setField('name')} error={errors.name} />
          <TextAreaField
            label="Description"
            name="description"
            value={form.description}
            onChange={setField('description')}
            error={errors.description}
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
            {/* Driven by the ExerciseCategory enum rather than hardcoded --
                "Conditioning" and "Core" are not valid exercise_type values and
                the API rejected them with a 422. */}
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

          {/* These three exist on the exercises table but had no inputs, so an
              admin could never set them: step-by-step instructions and the
              YouTube video/thumbnail the library cards and detail page render. */}
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
              name="video_url"
              type="url"
              value={form.video_url}
              onChange={setField('video_url')}
              error={errors.video_url}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <TextField
              label="Thumbnail URL"
              name="thumbnail_url"
              type="url"
              value={form.thumbnail_url}
              onChange={setField('thumbnail_url')}
              error={errors.thumbnail_url}
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
