import Icon from './Icon.jsx'

// How many pages to show either side of the current one.
const PAGE_SPAN = 1

/**
 * Page numbers to render: always the first and last, a window around the
 * current page, and an ellipsis wherever that skips a run.
 *
 * The window is nudged inward at the ends so the control keeps a roughly
 * constant width instead of shrinking on page 1 and growing in the middle.
 */
function pageItems(current, last) {
    const windowSize = PAGE_SPAN * 2 + 1
    if (last <= windowSize + 4) {
        return Array.from({ length: last }, (_, i) => ({ key: i + 1, page: i + 1 }))
    }

    let start = Math.max(2, current - PAGE_SPAN)
    let end = Math.min(last - 1, current + PAGE_SPAN)

    if (end - start + 1 < windowSize) {
        if (start === 2) end = Math.min(last - 1, start + windowSize - 1)
        else start = Math.max(2, end - windowSize + 1)
    }

    const pages = [1, ...Array.from({ length: end - start + 1 }, (_, i) => start + i), last]

    const items = []
    let previous = 0
    for (const page of pages) {
        if (previous && page - previous > 1) items.push({ key: `gap-${previous}`, gap: true })
        items.push({ key: page, page })
        previous = page
    }
    return items
}

/**
 * Previous / numbered / next page controls. Renders nothing when there is
 * only one page. `onPageChange` always receives the new page number.
 */
export function Pagination({ page, lastPage, onPageChange }) {
    if (lastPage <= 1) return null

    return (
        <div className="mt-xl flex justify-center gap-sm">
            <button
                type="button"
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Previous page"
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-surface-variant text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Icon name="chevron_left" />
            </button>

            <span className="sm:hidden flex items-center px-md font-label-bold text-label-bold text-secondary">
        Page {page} of {lastPage}
      </span>

            {pageItems(page, lastPage).map((item) =>
                    item.gap ? (
                        <span
                            key={item.key}
                            aria-hidden="true"
                            className="hidden sm:flex w-10 h-10 items-center justify-center text-secondary"
                        >
            …
          </span>
                    ) : (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => onPageChange(item.page)}
                            aria-label={`Page ${item.page}`}
                            aria-current={item.page === page ? 'page' : undefined}
                            className={`hidden sm:flex w-10 h-10 rounded-lg items-center justify-center font-label-bold text-label-bold transition-colors ${
                                item.page === page
                                    ? 'bg-primary text-on-primary shadow-sm'
                                    : 'border border-surface-variant text-secondary hover:bg-surface-container'
                            }`}
                        >
                            {item.page}
                        </button>
                    )
            )}

            <button
                type="button"
                disabled={page === lastPage}
                onClick={() => onPageChange(page + 1)}
                aria-label="Next page"
                className="w-10 h-10 rounded-lg flex items-center justify-center border border-surface-variant text-secondary hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Icon name="chevron_right" />
            </button>
        </div>
    )
}
