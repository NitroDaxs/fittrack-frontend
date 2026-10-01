import Icon from './Icon'

/**
 * Sortable table shell for the admin screens.
 *
 * columns: [{ key, header, sortable, className, headerClassName, render(row) }]
 * sort:    { key, dir }  -- controlled by the parent so the sort travels to the API
 */
export default function DataTable({ columns, rows, sort, onSortChange, rowKey = (row) => row.id, empty }) {
  const toggleSort = (key) => {
    if (!onSortChange) return
    if (sort?.key === key) onSortChange({ key, dir: sort.dir === 'asc' ? 'desc' : 'asc' })
    else onSortChange({ key, dir: 'asc' })
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-outline-variant">
            {columns.map((column) => {
              const active = sort?.key === column.key
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className={`py-sm px-md font-label-bold text-label-bold text-on-surface-variant whitespace-nowrap ${
                    column.headerClassName ?? ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={`inline-flex items-center gap-xs transition-colors hover:text-primary ${
                        active ? 'text-primary' : ''
                      }`}
                    >
                      {column.header}
                      <Icon
                        name={active ? (sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                        size={16}
                        className={active ? '' : 'opacity-40'}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant font-body-md text-body-md text-on-surface">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-xl text-center text-secondary">
                {empty ?? 'Nothing to show.'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-surface-container-lowest transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className={`py-sm px-md align-middle ${column.className ?? ''}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function TableFooter({ children }) {
  return (
    <div className="bg-surface-container-low border-t border-outline-variant px-md py-sm flex flex-wrap items-center justify-between gap-sm">
      {children}
    </div>
  )
}

export function RowActions({ onEdit, onDelete, editLabel = 'Edit', deleteLabel = 'Delete' }) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onEdit}
        aria-label={editLabel}
        title={editLabel}
        className="p-xs text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
      >
        <Icon name="edit" size={20} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
        className="p-xs text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container"
      >
        <Icon name="delete" size={20} />
      </button>
    </div>
  )
}
