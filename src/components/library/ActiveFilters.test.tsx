import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import ActiveFilters from './ActiveFilters'

const options = {
  muscleGroups: [
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
  ],
  equipment: [{ value: 'barbell', label: 'Barbell' }],
  difficulties: [{ value: 'beginner', label: 'Beginner' }],
}

const values = { muscleGroups: ['chest', 'back'], equipment: ['barbell'], difficulty: 'beginner' }
const removeLabel = (name: string) => i18n.t('exerciseLibrary.filters.remove', { name })

describe('ActiveFilters', () => {
  it('shows the result count, or a filtering message while loading', () => {
    const { rerender } = render(<ActiveFilters values={values} options={options} onChange={() => {}} total={12} />)
    expect(screen.getByText(i18n.t('exerciseLibrary.matching', { count: 12 }))).toBeInTheDocument()
    rerender(<ActiveFilters values={values} options={options} onChange={() => {}} />)
    expect(screen.getByText(i18n.t('exerciseLibrary.filtering'))).toBeInTheDocument()
  })

  it('shows a pill per applied filter', () => {
    render(<ActiveFilters values={values} options={options} onChange={() => {}} />)
    for (const name of ['Chest', 'Back', 'Barbell', 'Beginner']) {
      expect(screen.getByRole('button', { name: removeLabel(name) })).toBeInTheDocument()
    }
  })

  it('removes one filter at a time', async () => {
    const onChange = vi.fn()
    render(<ActiveFilters values={values} options={options} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: removeLabel('Chest') }))
    expect(onChange).toHaveBeenLastCalledWith({ ...values, muscleGroups: ['back'] })
    await userEvent.click(screen.getByRole('button', { name: removeLabel('Barbell') }))
    expect(onChange).toHaveBeenLastCalledWith({ ...values, equipment: [] })
    await userEvent.click(screen.getByRole('button', { name: removeLabel('Beginner') }))
    expect(onChange).toHaveBeenLastCalledWith({ ...values, difficulty: null })
  })

  it('labels unknown values by their slug', () => {
    render(<ActiveFilters values={{ muscleGroups: ['neck'], equipment: [], difficulty: null }} options={options} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: removeLabel('neck') })).toBeInTheDocument()
  })

  it('offers "clear all" only when handled', async () => {
    const onClearAll = vi.fn()
    const { rerender } = render(<ActiveFilters values={values} options={options} onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: i18n.t('common.clearFilters') })).not.toBeInTheDocument()
    rerender(<ActiveFilters values={values} options={options} onChange={() => {}} onClearAll={onClearAll} />)
    await userEvent.click(screen.getByRole('button', { name: i18n.t('common.clearFilters') }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })
})
