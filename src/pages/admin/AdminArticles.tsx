import { useTranslation } from 'react-i18next'
import i18n, { tLabel } from '../../i18n/index'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { adminService } from '../../services/admin'
import type { Article, ArticleForm } from '../../types/articles'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter } from '../../components/admin/AdminPage'
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
  const { t } = useTranslation()
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
    if (!form.title.trim()) found.title = t('common.titleIsRequired')
    if (isNew && !form.body.trim()) found.body = t('admin.articles.writeTheArticleBody')
    setErrors(found)
    if (Object.keys(found).length > 0) return
    crud.save(form)
  }

  const columns: Column<Article>[] = [
    {
      key: 'title',
      header: t('common.title'),
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
      header: t('admin.articles.author'),
      sortable: true,
      className: 'hidden md:table-cell text-on-surface-variant',
      headerClassName: 'hidden md:table-cell',
      render: (row) => row.author,
    },
    {
      key: 'status',
      header: t('common.status'),
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
          {tLabel(row.status)}
        </span>
      ),
    },
    {
      key: 'date',
      header: t('admin.articles.date'),
      sortable: true,
      className: 'hidden sm:table-cell text-on-surface-variant whitespace-nowrap',
      headerClassName: 'hidden sm:table-cell',
      render: (row) =>
        new Date(row.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: '2-digit' }),
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
        title={t('admin.articles.manageArticles')}
        description={t('admin.articles.manageContentCreationEditingAndPublishing')}
        actionLabel={t('admin.articles.newArticle')}
        onAction={() => crud.setEditing('new')}
      />

      <AdminToolbar search={crud.search} onSearch={crud.setSearch} placeholder={t('common.searchArticles')}>
        <AdminSelect
          label={t('common.status')}
          value={status}
          onChange={setStatus}
          options={[
            { value: '', label: t('common.allStatus') },
            { value: 'published', label: t('admin.articles.published') },
            { value: 'draft', label: t('admin.articles.draft') },
          ]}
        />
        <AdminSelect
          label={t('admin.articles.author')}
          value={author}
          onChange={setAuthor}
          options={[
            { value: '', label: t('admin.articles.allAuthors') },
            ...(taxonomies?.authors ?? []).map((name) => ({ value: name, label: name })),
          ]}
        />
      </AdminToolbar>

      <div className="bg-surface rounded-xl elev-card border border-outline-variant overflow-hidden">
        {crud.error ? (
          <ErrorState error={crud.error} onRetry={crud.refetch} />
        ) : crud.loading ? (
          <Spinner label={t('admin.articles.loadingArticles')} />
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={crud.rows}
              sort={crud.sort}
              onSortChange={crud.setSort}
              empty={t('admin.articles.noArticlesMatchThoseFilters')}
            />
            <TableFooter>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {t('admin.articles.showingOfArticles', { shown: crud.rows.length, total: crud.meta?.total ?? crud.rows.length })}
              </span>
              <Pagination page={crud.page} lastPage={crud.meta?.lastPage ?? 1} onPageChange={crud.setPage} className="" />
            </TableFooter>
          </>
        )}
      </div>

      <Modal
        open={Boolean(crud.editing)}
        title={isNew ? t('admin.articles.newArticle') : t('admin.articles.editArticle')}
        description={isNew ? undefined : t('admin.articles.leaveTheBodyEmptyToKeep')}
        onClose={() => crud.setEditing(null)}
        footer={<ModalFooter onCancel={() => crud.setEditing(null)} saving={crud.saving} submitLabel={t('admin.articles.saveArticle')} />}
      >
        <form id="crud-form" onSubmit={submit} noValidate className="space-y-md">
          <TextField
            label={t('common.title')}
            name="title"
            value={form.title}
            onChange={setField('title')}
            error={errors.title ?? crud.fieldErrors.title}
          />
          {/* The API splits this into blocks: blank lines separate paragraphs,
              and a short line ending in a colon becomes a heading. */}
          <TextAreaField
            label={t('admin.articles.bodyBlankLineBetweenParagraphsEnd')}
            name="body"
            value={form.body}
            onChange={setField('body')}
            error={errors.body ?? crud.fieldErrors.body}
            rows={8}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <SelectField label={t('common.category')} name="category" value={form.category} onChange={setField('category')}>
              {(taxonomies?.articleCategories ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {tLabel(option.label)}</option>
              ))}
            </SelectField>
            <SelectField label={t('common.status')} name="status" value={form.status} onChange={setField('status')}>
              <option value="Draft">{t('admin.articles.draft')}</option>
              <option value="Published">{t('admin.articles.published')}</option>
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
