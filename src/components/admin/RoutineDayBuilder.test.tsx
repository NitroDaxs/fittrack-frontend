import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { exercise } from '../../test/fixtures'
import { renderWithProviders } from '../../test/utils'
import type { ProgrammeDay } from '../../types/routines'
import RoutineDayBuilder from './RoutineDayBuilder'

vi.mock('../../services/admin', () => ({ adminService: { exercises: { list: vi.fn() } } }))
const { adminService } = await import('../../services/admin')
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

const squat = exercise({ id: 1, name: 'Squat', primaryMuscles: 'Quads' })
const lunge = exercise({ id: 2, name: 'Lunge', primaryMuscles: 'Glutes' })

/** Holds the days like the routine form does, and exposes the latest value. */
let latest: ProgrammeDay[] = []
function Harness({ initial = [] as ProgrammeDay[], daysPerWeek = 3 as number | string }) {
  const [days, setDays] = useState(initial)
  latest = days
  return <RoutineDayBuilder days={days} onChange={setDays} daysPerWeek={daysPerWeek} />
}

const legDay: ProgrammeDay = {
  name: 'Legs',
  exercises: [
    { exercise_id: 1, name: 'Squat', target_sets: 3, target_reps: '5', rest_seconds: 180, notes: '' },
    { exercise_id: 2, name: 'Lunge', target_sets: 3, target_reps: '10', rest_seconds: 60, notes: '' },
  ],
}

beforeEach(() => {
  latest = []
  vi.mocked(adminService.exercises.list).mockReset().mockResolvedValue({
    data: [squat, lunge],
    meta: { total: 2, page: 1, perPage: 6, lastPage: 1 },
  })
})

describe('RoutineDayBuilder', () => {
  it('creates days to match days-per-week from an empty programme', async () => {
    renderWithProviders(<Harness daysPerWeek={3} />)
    expect(screen.getByText(t('admin.shared.thisRoutineHasNoDaysYet'))).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: t('admin.shared.createDays', { n: 3 }) }))
    expect(latest.map((day) => day.name)).toEqual([1, 2, 3].map((n) => t('common.day', { n })))
  })

  it('adds the first day when no target is set', async () => {
    renderWithProviders(<Harness daysPerWeek="" />)
    await userEvent.click(screen.getByRole('button', { name: t('admin.shared.addTheFirstDay') }))
    expect(latest).toHaveLength(1)
  })

  it('offers to fill up to the weekly target', async () => {
    renderWithProviders(<Harness initial={[legDay]} daysPerWeek={4} />)
    await userEvent.click(screen.getByRole('button', { name: t('admin.shared.addToMatchWk', { count: 3, target: 4 }) }))
    expect(latest).toHaveLength(4)
    expect(screen.queryByRole('button', { name: /addToMatchWk/ })).not.toBeInTheDocument()
  })

  it('renames and removes days, keeping a valid tab selected', async () => {
    renderWithProviders(<Harness initial={[legDay, { name: 'Push', exercises: [] }]} daysPerWeek={2} />)
    await userEvent.click(screen.getByRole('button', { name: /^Push/ }))
    const name = screen.getByLabelText(t('admin.shared.dayName'))
    await userEvent.clear(name)
    await userEvent.type(name, 'Upper')
    expect(latest[1].name).toBe('Upper')

    await userEvent.click(screen.getByRole('button', { name: t('common.remove', { name: 'Upper' }) }))
    expect(latest.map((day) => day.name)).toEqual(['Legs'])
    expect(screen.getByLabelText(t('admin.shared.dayName'))).toHaveValue('Legs')
  })

  it('edits, reorders and removes exercises in the active day', async () => {
    renderWithProviders(<Harness initial={[legDay]} />)
    const first = screen.getAllByRole('listitem')[0]
    expect(within(first).getByRole('button', { name: t('admin.shared.moveUp') })).toBeDisabled()

    await userEvent.click(within(first).getByRole('button', { name: t('admin.shared.moveDown') }))
    expect(latest[0].exercises.map((entry) => entry.name)).toEqual(['Lunge', 'Squat'])

    const sets = screen.getAllByLabelText(t('common.sets'))[0]
    await userEvent.clear(sets)
    expect(latest[0].exercises[0].target_sets).toBeNull()
    await userEvent.type(sets, '4')
    expect(latest[0].exercises[0].target_sets).toBe(4)

    const reps = screen.getAllByLabelText(t('common.reps'))[0]
    await userEvent.clear(reps)
    await userEvent.type(reps, '12-15')
    expect(latest[0].exercises[0].target_reps).toBe('12-15')

    await userEvent.click(screen.getByRole('button', { name: t('common.remove', { name: 'Squat' }) }))
    expect(latest[0].exercises.map((entry) => entry.name)).toEqual(['Lunge'])
  })

  it('searches the library once two characters are typed and adds with defaults', async () => {
    renderWithProviders(<Harness initial={[{ name: 'Legs', exercises: [] }]} />)
    expect(screen.getByText(t('admin.shared.noExercisesInThisDayYet'))).toBeInTheDocument()
    const search = screen.getByLabelText(t('common.addAnExercise'))
    await userEvent.type(search, 's')
    expect(adminService.exercises.list).not.toHaveBeenCalled()
    await userEvent.type(search, 'q')

    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    expect(latest[0].exercises).toEqual([
      { exercise_id: 1, name: 'Squat', target_sets: 3, target_reps: '8-12', rest_seconds: 120, notes: '' },
    ])
    expect(search).toHaveValue('')
  })

  it('does not add the same exercise to a day twice', async () => {
    renderWithProviders(<Harness initial={[legDay]} />)
    await userEvent.type(screen.getByLabelText(t('common.addAnExercise')), 'sq')
    expect(await screen.findByRole('button', { name: /Squat.*Quads/ })).toBeDisabled()
  })

  it('says when the search finds nothing', async () => {
    vi.mocked(adminService.exercises.list).mockResolvedValue({ data: [], meta: { total: 0, page: 1, perPage: 6, lastPage: 1 } })
    renderWithProviders(<Harness initial={[legDay]} />)
    await userEvent.type(screen.getByLabelText(t('common.addAnExercise')), 'zz')
    expect(await screen.findByText(t('admin.shared.nothingMatches', { query: 'zz' }))).toBeInTheDocument()
  })
})
