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

const blankArticle = {
  title: '',
  excerpt: '',
  body: '',
  category: 'Training Theory',
  author: '',
  status: 'Draft',
  readMinutes: 5,
  date: new Date().toISOString().slice(0, 10),
}

export default function AdminArticles() {
  const [status, setStatus] = useState('All Status')
  const [author, setAuthor] = useState('All Authors')
  const taxonomies = useTaxonomies()

  const crud = useCrud(adminApi.articles, {
    defaultSort: { key: 'date', dir: 'desc' },
    extraQuery: { status, author },
  })

  const [form, setForm] = useState(blankArticle)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (crud.editing) {
      setForm({ ...blankArticle, ...crud.editing })
      setErrors({})
    }
  }, [crud.editing])

  const setField = (name) => (event) => setForm((f) => ({ ...f, [name]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    const found = {}
    if (!form.title.trim()) found.title = 'Title is required.'
    if (!form.excerpt.trim()) found.excerpt = 'Write a short summary.'
    if (!form.author.trim()) found.author = 'Attribute the piece to an author.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save({ ...form, readMinutes: Number(form.readMinutes) })
  }

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md">
          <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
            <Icon name="article" />
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-on-surface truncate">{row.title}</span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant truncate max-w-xs">
              {row.excerpt}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'author',
      header: 'Author',
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row) => (
        <span
          className={`px-sm py-xs rounded-full font-label-sm text-label-sm inline-flex items-center gap-xs ${
            row.status === 'Published'
              ? 'bg-primary-fixed text-on-primary-fixed-variant'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          <Icon name={row.status === 'Published' ? 'check_circle' : 'edit_document'} size={14} />
          {row.status}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      className: 'hidden sm:table-cell text-on-surface-variant whitespace-nowrap',
      headerClassName: 'hidden sm:table-cell',
      render: (row) =>
        new Date(row.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }),
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
        title="Manage Articles"
        description="Manage content creation, editing, and publishing status."
        actionLabel="New article"
        onAction={() => crud.setEditing({})}
      />

      <Notice message={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search articles...">
        <AdminSelect label="Status" value={status} onChange={setStatus} options={['All Status', 'Published', 'Draft']} />
        <AdminSelect
          label="Author"
          value={author}
          onChange={setAuthor}
          options={['All Authors', ...(taxonomies?.authors ?? [])]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label="Loading articles" />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty="No articles match those filters."
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {crud.rows.length} of {crud.meta?.total ?? crud.rows.length} articles
              </span>
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={crud.editing?.id ? 'Edit article' : 'New article'}
        description="Body content is edited in the full editor; this covers the listing metadata."
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} submitLabel="Save article" />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField label="Title" name="title" value={form.title} onChange={setField('title')} error={errors.title} />
          <TextAreaField
            label="Excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={setField('excerpt')}
            error={errors.excerpt}
          />
          {/* The API splits this into blocks: blank lines separate paragraphs,
              and a short line ending in a colon becomes a heading. */}
          <TextAreaField
            label="Body — blank line between paragraphs, end a line with ':' for a heading"
            name="body"
            value={form.body}
            onChange={setField('body')}
            error={errors.body}
            rows={8}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <TextField
              label="Author"
              name="author"
              value={form.author}
              onChange={setField('author')}
              error={errors.author}
              placeholder="Dr. E. Reynolds"
            />
            {/* Taxonomy entries are { value, label } objects -- rendering the
                object itself threw "Objects are not valid as a React child" and
                took the whole modal down. Also needs articleCategories, not the
                exercise taxonomy. */}
            <SelectField label="Category" name="category" value={form.category} onChange={setField('category')}>
              {(taxonomies?.articleCategories ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <SelectField label="Status" name="status" value={form.status} onChange={setField('status')}>
              <option>Draft</option>
              <option>Published</option>
            </SelectField>
            <TextField
              label="Read time (min)"
              name="readMinutes"
              type="number"
              min="1"
              value={form.readMinutes}
              onChange={setField('readMinutes')}
            />
            <TextField label="Publish date" name="date" type="date" value={form.date} onChange={setField('date')} />
          </div>
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
