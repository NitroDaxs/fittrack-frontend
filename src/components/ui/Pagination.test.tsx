import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { Pagination } from './Pagination'

const pageButtons = () =>
  screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-label')?.startsWith(i18n.t('ui.page', { page: '' }).trim()))
    .map((button) => Number(button.textContent))

/** The numbered buttons with an ellipsis marker wherever pages are skipped. */
const layout = (page: number, lastPage: number) => {
  const { container, unmount } = render(<Pagination page={page} lastPage={lastPage} onPageChange={() => {}} />)
  const items = [...container.querySelectorAll('button[aria-current], button[aria-label], span[aria-hidden]')]
    .filter((el) => el.tagName === 'SPAN' || /^\d+$/.test(el.textContent ?? ''))
    .map((el) => (el.tagName === 'SPAN' ? '…' : Number(el.textContent)))
  unmount()
  return items
}

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} lastPage={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows every page when there are few', () => {
    expect(layout(1, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('keeps a constant width window with ellipses on long ranges', () => {
    expect(layout(1, 20)).toEqual([1, 2, 3, 4, '…', 20])
    expect(layout(2, 20)).toEqual([1, 2, 3, 4, '…', 20])
    expect(layout(10, 20)).toEqual([1, '…', 9, 10, 11, '…', 20])
    expect(layout(19, 20)).toEqual([1, '…', 17, 18, 19, 20])
    expect(layout(20, 20)).toEqual([1, '…', 17, 18, 19, 20])
  })

  it('marks the current page', () => {
    render(<Pagination page={3} lastPage={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: i18n.t('ui.page', { page: 3 }) })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: i18n.t('ui.page', { page: 2 }) })).not.toHaveAttribute('aria-current')
    expect(screen.getByText(i18n.t('ui.pageOf', { page: 3, last: 5 }))).toBeInTheDocument()
    expect(pageButtons()).toEqual([1, 2, 3, 4, 5])
  })

  it('reports the chosen page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} lastPage={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.previousPage') }))
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.nextPage') }))
    await userEvent.click(screen.getByRole('button', { name: i18n.t('ui.page', { page: 5 }) }))
    expect(onPageChange.mock.calls).toEqual([[2], [4], [5]])
  })

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(<Pagination page={1} lastPage={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: i18n.t('ui.previousPage') })).toBeDisabled()
    expect(screen.getByRole('button', { name: i18n.t('ui.nextPage') })).toBeEnabled()
    rerender(<Pagination page={3} lastPage={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: i18n.t('ui.nextPage') })).toBeDisabled()
  })

  it('scrolls to the top when the page changes', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo')
    const { rerender } = render(<Pagination page={1} lastPage={3} onPageChange={() => {}} />)
    scrollTo.mockClear()
    rerender(<Pagination page={2} lastPage={3} onPageChange={() => {}} />)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})
