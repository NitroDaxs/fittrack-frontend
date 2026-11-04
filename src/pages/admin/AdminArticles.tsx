import { useTranslation } from 'react-i18next'
import i18n, { tLabel } from '../../i18n/index'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { adminService } from '../../services/admin'
import type { Article, ArticleForm } from '../../types/articles'
import { adminArticleSchema, type AdminArticleValues } from '../../schemas/admin-article.schema'
import { AdminHeader, AdminSelect, AdminToolbar, DeleteDialog, ModalFooter } from '../../components/admin/AdminPage'
import DataTable, { RowActions, TableFooter, type Column } from '../../components/ui/DataTable'
import Modal from '../../components/ui/Modal'
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field'
import { Pagination } from '../../components/ui/Pagination'
import { ErrorState, Spinner } from '../../components/ui/States'
import Icon from '../../components/ui/Icon'
import { useCrud } from '../../hooks/useCrud'
import { useTaxonomies } from '../../hooks/useTaxonomies'

const blankArticle: AdminArticleValues = {
  title: '',
  body: '',
  category: 'Training Theory',
  status: 'Draft',
  imageUrl: '',
}

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

  const isNew = crud.editing === 'new'
  // A new article needs a body; an edit with a blank body keeps the current one.
  const schema = useMemo(() => adminArticleSchema(isNew), [isNew])
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdminArticleValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: blankArticle,
  })

  useEffect(() => {
    if (!crud.editing) return
    const row = crud.editingRow
    // The list has no article bodies, so editing starts with an empty body box.
    reset(
      row
        ? { title: row.title, body: '', category: row.category, status: row.status as AdminArticleValues['status'], imageUrl: row.image ?? '' }
        : blankArticle,
    )
  }, [crud.editing, crud.editingRow, reset])

  const submit = handleSubmit((values) => crud.save(values))

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
          <TextField label={t('common.title')} id="title" error={errors.title?.message} {...register('title')} />
          {/* The API splits this into blocks: blank lines separate paragraphs,
              and a short line ending in a colon becomes a heading. */}
          <TextAreaField
            label={t('admin.articles.bodyBlankLineBetweenParagraphsEnd')}
            id="body"
            error={errors.body?.message}
            rows={8}
            {...register('body')}
          />
          <TextField
            label={t('admin.articles.imageUrl')}
            id="imageUrl"
            type="url"
            error={errors.imageUrl?.message}
            placeholder="https://images.unsplash.com/photo-..."
            {...register('imageUrl')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <SelectField label={t('common.category')} id="category" error={errors.category?.message} {...register('category')}>
              {(taxonomies?.articleCategories ?? []).map((option) => (
                <option key={option.value} value={option.label}>
                  {tLabel(option.label)}</option>
              ))}
            </SelectField>
            <SelectField label={t('common.status')} id="status" {...register('status')}>
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
