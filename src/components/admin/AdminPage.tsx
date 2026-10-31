import type { ReactNode } from 'react'
import type { SelectOption } from '../../types/shared'
import type { Notice as NoticeValue } from '../../hooks/useCrud'
import Icon from '../ui/Icon'
import SearchInput from '../ui/SearchInput'
import Modal from '../ui/Modal'

interface AdminHeaderProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function AdminHeader({ title, description, actionLabel, onAction }: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-md">
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">{title}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
      </div>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="bg-primary-container text-on-primary font-label-bold text-label-bold px-lg py-md rounded-lg shadow-sm hover:bg-primary transition-colors flex items-center gap-sm w-full md:w-auto justify-center"
        >
          <Icon name="add" size={20} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

interface AdminToolbarProps {
  search: string
  onSearch: (value: string) => void
  placeholder: string
  children?: ReactNode
}

export function AdminToolbar({ search, onSearch, placeholder, children }: AdminToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-md mb-lg">
      <SearchInput value={search} onChange={onSearch} placeholder={placeholder} className="flex-1" />
      {children}
    </div>
  )
}

interface AdminSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}

export function AdminSelect({ label, value, onChange, options }: AdminSelectProps) {
  return (
    <div className="relative">
      <label className="sr-only" htmlFor={`filter-${label}`}>
        {label}
      </label>
      <select
        id={`filter-${label}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full md:w-48 bg-surface-container-low rounded-lg py-sm pl-md pr-xl ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-body-md text-on-surface appearance-none transition-all"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        size={20}
        className="absolute right-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none"
      />
    </div>
  )
}

export function Notice({ notice }: { notice: NoticeValue | null }) {
  if (!notice) return null
  const isError = notice.tone === 'error'
  return (
    <p
      role={isError ? 'alert' : 'status'}
      className={`mb-lg rounded-lg px-md py-sm font-label-bold text-label-bold flex items-center gap-xs ${
        isError ? 'bg-error-container text-on-error-container' : 'bg-primary-fixed text-on-primary-fixed-variant'
      }`}
    >
      <Icon name={isError ? 'error' : 'check_circle'} size={18} filled />
      {notice.message}
    </p>
  )
}

interface DeleteDialogProps {
  row: unknown
  label?: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteDialog({ row, label, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <Modal
      open={Boolean(row)}
      title="Delete this record?"
      description="This permanently deletes it. It cannot be undone."
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-lg py-sm rounded-lg border border-outline text-on-surface font-label-bold text-label-bold hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-lg py-sm rounded-lg bg-error text-on-error font-label-bold text-label-bold hover:opacity-90 transition-opacity"
          >
            Delete
          </button>
        </>
      }
    >
      <p className="font-body-md text-body-md text-on-surface">
        <span className="font-semibold">{label}</span> will be deleted.
      </p>
    </Modal>
  )
}

export function ModalFooter({ onCancel, saving, submitLabel = 'Save' }: { onCancel: () => void; saving: boolean; submitLabel?: string }) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="px-lg py-sm rounded-lg border border-outline text-on-surface font-label-bold text-label-bold hover:bg-surface-container transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="crud-form"
        disabled={saving}
        className="px-lg py-sm rounded-lg bg-primary-container text-on-primary font-label-bold text-label-bold hover:bg-primary transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : submitLabel}
      </button>
    </>
  )
}
