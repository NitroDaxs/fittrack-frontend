import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { adminService } from '../../services/admin'
import type { Article, ArticleForm } from '../../types/articles'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter, Notice } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import { useCrud } from '../../hooks/useCrud'
import { useTaxonomies } from '../../hooks/useTaxonomies'

const blankArticle: ArticleForm = {
  title: '',
  body: '',
  category: 'Training Theory',
  status: 'Draft',
}

type FormErrors = Partial<Record<keyof ArticleForm, string>>

export default function AdminArticles() {
  const [status, setStatus] = useState('')
  const [author, setAuthor] = useState('')
  const taxonomies = useTaxonomies()

  const crud = useCrud<Article, ArticleForm>(adminService.articles, {
    resource: 'articles',
    defaultSort: { key: 'date', dir: 'desc' },
    extraQuery: { status, author },
  })

  const [form, setForm] = useState<ArticleForm>(blankArticle)
  const [errors, setErrors] = useState<FormErrors>({})
  const isNew = crud.editing === 'new'

  useEffect(() => {
    if (!crud.editing) return
    const row = crud.editingRow
    // The list has no article bodies, so editing starts with an empty body box.
    setForm(row ? { title: row.title, body: '', category: row.category, status: row.status } : blankArticle)
    setErrors({})
  }, [crud.editing, crud.editingRow])

  const setField = (name: keyof ArticleForm) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [name]: event.target.value }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found: FormErrors = {}
    if (!form.title.trim()) found.title = 'Title is required.'
    if (isNew && !form.body.trim()) found.body = 'Write the article body.'
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save(form)
  }

  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (row) => (
        <span className="flex items-center gap-md">
          <span className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
            <Icon name="file-text" />
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
      render: (row) => row.author,
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
          <Icon name={row.status === 'Published' ? 'circle-check' : 'file-pen'} size={14} />
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
        onAction={() => crud.setEditing('new')}
      />

      <Notice notice={crud.notice} />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder="Search articles...">
        <AdminSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: 'All Status' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
          ]}
        />
        <AdminSelect
          label="Author"
          value={author}
          onChange={setAuthor}
          options={[
            { value: '', label: 'All Authors' },
            ...(taxonomies?.authors ?? []).map((name) => ({ value: name, label: name })),
          ]}
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
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={isNew ? 'New article' : 'Edit article'}
        description={isNew ? undefined : 'Leave the body empty to keep the current content.'}
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} submitLabel="Save article" />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          {crud.saveError ? <Notice notice={{ message: crud.saveError, tone: 'error' }} /> : null}
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={setField('title')}
            error={errors.title ?? crud.fieldErrors.title}
          />
          {/* The API splits this into blocks: blank lines separate paragraphs,
              and a short line ending in a colon becomes a heading. */}
          <TextAreaField
            label="Body — blank line between paragraphs, end a line with ':' for a heading"
            name="body"
            value={form.body}
            onChange={setField('body')}
            error={errors.body ?? crud.fieldErrors.body}
            rows={8}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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
