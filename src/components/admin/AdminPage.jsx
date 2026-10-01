import Icon from '../ui/Icon'
import SearchInput from '../ui/SearchInput'
import Modal from '../ui/Modal'

export function AdminHeader({ title, description, actionLabel, onAction }) {
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

export function AdminToolbar({ search, onSearch, placeholder, children }) {
  return (
    <div className="flex flex-col md:flex-row gap-md mb-lg">
      <SearchInput value={search} onChange={onSearch} placeholder={placeholder} className="flex-1" />
      {children}
    </div>
  )
}

export function AdminSelect({ label, value, onChange, options }) {
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
          <option key={option} value={option}>
            {option}
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

export function Notice({ message }) {
  if (!message) return null
  return (
    <p className="mb-lg bg-primary-fixed text-on-primary-fixed-variant rounded-lg px-md py-sm font-label-bold text-label-bold flex items-center gap-xs">
      <Icon name="check_circle" size={18} filled />
      {message}
    </p>
  )
}

export function DeleteDialog({ row, label, onCancel, onConfirm }) {
  return (
    <Modal
      open={Boolean(row)}
      title="Delete this record?"
      description="This removes it from the local demo state. It cannot be undone from here."
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
        <span className="font-semibold">{label}</span> will be removed from the list.
      </p>
    </Modal>
  )
}

export function ModalFooter({ onCancel, saving, submitLabel = 'Save' }) {
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
