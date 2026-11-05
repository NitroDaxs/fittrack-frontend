import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { useWorkoutStore } from '../store/workout.store'
import type { Draft } from '../types/workout'
import { ApiError } from '../services/http'
import { exercise } from '../test/fixtures'
import { renderWithProviders } from '../test/utils'
import ActiveWorkout from './ActiveWorkout'
import WorkoutBuilder from './WorkoutBuilder'

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../services/exercises', () => ({ exerciseService: { list: vi.fn() } }))
vi.mock('../services/me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/me')>()),
  meService: { logWorkout: vi.fn() },
}))

const { exerciseService } = await import('../services/exercises')
const { meService } = await import('../services/me')
const t = (key: string, params?: Record<string, unknown>) => i18n.t(key, params)

const squat = exercise({ id: 1, name: 'Squat', muscleGroups: ['Quads'], equipment: 'Barbell' })
const bench = exercise({ id: 2, name: 'Bench Press', muscleGroups: ['Chest'] })

function Where() {
  return <p>landed on {useLocation().pathname}</p>
}

const routes = (
  <Routes>
    <Route path="/builder" element={<WorkoutBuilder />} />
    <Route path="/workout/active" element={<ActiveWorkout />} />
    <Route path="*" element={<Where />} />
  </Routes>
)

/** Renders the routes, first starting a session for tests that begin in the logger. */
const renderApp = (route: string, draft?: Draft) => {
  if (draft) useWorkoutStore.getState().startSession(draft)
  return renderWithProviders(routes, { route })
}

const item = (e: typeof squat, sets: number, reps: number, weight: number) => ({
  uid: `u${e.id}`,
  exerciseId: e.id,
  name: e.name,
  image: '',
  imageWide: '',
  icon: e.icon,
  tags: e.muscleGroups.slice(0, 1),
  sets,
  reps,
  weight,
})

beforeEach(() => {
  vi.mocked(exerciseService.list).mockReset().mockResolvedValue({
    data: [squat, bench],
    meta: { total: 2, page: 1, perPage: 6, lastPage: 1 },
  })
  vi.mocked(meService.logWorkout).mockReset().mockResolvedValue({} as never)
})

describe('WorkoutBuilder', () => {
  it('starts empty with the actions disabled', () => {
    renderApp('/builder')
    expect(screen.getByText(t('workoutBuilder.noExercisesYet'))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t('workoutBuilder.startWorkout') })).toBeDisabled()
    expect(screen.getByRole('button', { name: t('workoutBuilder.clear') })).toBeDisabled()
    // The library is not searched until the picker opens.
    expect(exerciseService.list).not.toHaveBeenCalled()
  })

  it('searches the library and adds picked exercises', async () => {
    renderApp('/builder')
    const search = screen.getByLabelText(t('workoutBuilder.searchLibraryToAddExercise'))
    await userEvent.click(search)
    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    expect(search).toHaveValue('')
    expect(screen.getByRole('heading', { name: 'Squat' })).toBeInTheDocument()
    expect(screen.getByText(t('workoutBuilder.summary', { count: 1, sets: 3 }))).toBeInTheDocument()

    await userEvent.type(search, 'ben')
    await waitFor(() => expect(exerciseService.list).toHaveBeenLastCalledWith({ search: 'ben', perPage: 6 }, expect.any(AbortSignal)))
  })

  it('says when nothing matches', async () => {
    vi.mocked(exerciseService.list).mockResolvedValue({ data: [], meta: { total: 0, page: 1, perPage: 6, lastPage: 1 } })
    renderApp('/builder')
    await userEvent.type(screen.getByLabelText(t('workoutBuilder.searchLibraryToAddExercise')), 'zzz')
    expect(await screen.findByText(t('workoutBuilder.noExercisesMatch', { query: 'zzz' }))).toBeInTheDocument()
  })

  it('edits, reorders, removes and clears items', async () => {
    renderApp('/builder')
    await userEvent.click(screen.getByLabelText(t('workoutBuilder.searchLibraryToAddExercise')))
    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    await userEvent.click(screen.getByRole('button', { name: /Bench Press/ }))

    const names = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(names()).toEqual(['Squat', 'Bench Press'])
    expect(screen.getByRole('button', { name: t('workoutBuilder.moveUp', { name: 'Squat' }) })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: t('workoutBuilder.moveDown', { name: 'Squat' }) }))
    expect(names()).toEqual(['Bench Press', 'Squat'])

    const [setsForBench] = screen.getAllByLabelText(t('common.sets'))
    await userEvent.clear(setsForBench)
    await userEvent.type(setsForBench, '5')
    expect(screen.getByText(t('workoutBuilder.summary', { count: 2, sets: 8 }))).toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: t('common.remove', { name: 'Squat' }) })[0])
    expect(names()).toEqual(['Bench Press'])

    await userEvent.click(screen.getByRole('button', { name: t('workoutBuilder.clear') }))
    expect(screen.getByText(t('workoutBuilder.noExercisesYet'))).toBeInTheDocument()
  })

  it('reorders by drag and drop', async () => {
    renderApp('/builder')
    await userEvent.click(screen.getByLabelText(t('workoutBuilder.searchLibraryToAddExercise')))
    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    await userEvent.click(screen.getByRole('button', { name: /Bench Press/ }))

    const rows = screen.getAllByRole('listitem').filter((li) => li.hasAttribute('draggable'))
    fireEvent.dragStart(rows[1], { dataTransfer: { effectAllowed: '' } })
    fireEvent.dragOver(rows[0])
    fireEvent.drop(rows[0])
    expect(screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(['Bench Press', 'Squat'])
  })

  it('renames the workout and starts the session', async () => {
    renderApp('/builder')
    const name = screen.getByLabelText(t('workoutBuilder.workoutName'))
    await userEvent.clear(name)
    await userEvent.type(name, 'Leg day')
    await userEvent.click(name.ownerDocument.querySelector('input[aria-label="' + t('workoutBuilder.searchLibraryToAddExercise') + '"]')!)
    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    await userEvent.click(screen.getByRole('button', { name: t('workoutBuilder.startWorkout') }))
    expect(screen.getByRole('heading', { name: 'Squat', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(t('activeWorkout.exerciseOf', { current: 1, total: 1 }))).toBeInTheDocument()
  })
})

describe('ActiveWorkout', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('sends people without a session back to the builder', () => {
    renderApp('/workout/active')
    expect(screen.getByLabelText(t('workoutBuilder.workoutName'))).toBeInTheDocument()
  })

  const startLogger = (draft: Draft = { name: 'Push', items: [item(squat, 2, 5, 100), item(bench, 1, 8, 60)] }) =>
    renderApp('/workout/active', draft)

  it('shows the current exercise, set and targets', () => {
    startLogger()
    expect(screen.getByRole('heading', { name: 'Squat', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(t('activeWorkout.set', { current: 1, total: 2 }))).toBeInTheDocument()
    expect(screen.getByLabelText(t('activeWorkout.weightLbs'))).toHaveValue(100)
    expect(screen.getByLabelText(t('common.reps'))).toHaveValue(5)
    expect(screen.getByText(t('activeWorkout.firstSetOfThisExercise'))).toBeInTheDocument()
  })

  it('adjusts weight and reps with the steppers and by typing', async () => {
    startLogger()
    const weightLabel = t('activeWorkout.weightLbs')
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.increaseBy', { label: weightLabel, step: 5 }) }))
    expect(screen.getByLabelText(weightLabel)).toHaveValue(105)
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.decreaseBy', { label: t('common.reps'), step: 1 }) }))
    expect(screen.getByLabelText(t('common.reps'))).toHaveValue(4)
    fireEvent.change(screen.getByLabelText(weightLabel), { target: { value: '120' } })
    expect(screen.getByLabelText(weightLabel)).toHaveValue(120)
  })

  it('runs the rest timer between sets and lets it be paused, resumed and skipped', () => {
    vi.useFakeTimers()
    startLogger()
    const timer = () => screen.getByText(/^\d\d:\d\d$/)
    expect(timer()).toHaveTextContent('00:00')

    fireEvent.click(screen.getByRole('button', { name: t('activeWorkout.completeSet') }))
    expect(timer()).toHaveTextContent('01:30')
    expect(screen.getByText('100 lbs x 5 reps')).toBeInTheDocument()
    expect(screen.getByText(t('activeWorkout.set', { current: 2, total: 2 }))).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(3000))
    expect(timer()).toHaveTextContent('01:27')

    fireEvent.click(screen.getByRole('button', { name: t('activeWorkout.pause') }))
    act(() => vi.advanceTimersByTime(5000))
    expect(timer()).toHaveTextContent('01:27')

    fireEvent.click(screen.getByRole('button', { name: t('activeWorkout.resume') }))
    act(() => vi.advanceTimersByTime(1000))
    expect(timer()).toHaveTextContent('01:26')

    fireEvent.click(screen.getByRole('button', { name: t('activeWorkout.skip') }))
    expect(timer()).toHaveTextContent('00:00')
    expect(screen.getByRole('button', { name: t('activeWorkout.startRest') })).toBeInTheDocument()
  })

  it('stops the timer by itself at zero', () => {
    vi.useFakeTimers()
    startLogger()
    fireEvent.click(screen.getByRole('button', { name: t('activeWorkout.completeSet') }))
    act(() => vi.advanceTimersByTime(90_000))
    expect(screen.getByText('00:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: t('activeWorkout.startRest') })).toBeInTheDocument()
  })

  it('keeps the rest timer running while the logger is closed', () => {
    vi.useFakeTimers()
    const { unmount } = startLogger()
    fireEvent.click(screen.getByRole('button', { name: t('activeWorkout.completeSet') }))
    unmount()

    // Away from the logger for 20 seconds, then back.
    act(() => vi.advanceTimersByTime(20_000))
    renderApp('/workout/active')
    expect(screen.getByText(/^\d\d:\d\d$/)).toHaveTextContent('01:10')
    expect(screen.getByRole('button', { name: t('activeWorkout.pause') })).toBeInTheDocument()
  })

  it('jumps to another exercise from the list', async () => {
    startLogger()
    await userEvent.click(screen.getByRole('button', { name: /Bench Press/ }))
    expect(screen.getByRole('heading', { name: 'Bench Press', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(t('activeWorkout.exerciseOf', { current: 2, total: 2 }))).toBeInTheDocument()
  })

  it('quits back to the builder', async () => {
    startLogger()
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.quitWorkout') }))
    expect(screen.getByLabelText(t('workoutBuilder.workoutName'))).toBeInTheDocument()
  })

  it('keeps the builder exercises after quitting', async () => {
    renderApp('/builder')
    await userEvent.click(screen.getByLabelText(t('workoutBuilder.searchLibraryToAddExercise')))
    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    await userEvent.click(screen.getByRole('button', { name: t('workoutBuilder.startWorkout') }))
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.quitWorkout') }))
    expect(screen.getByRole('heading', { name: 'Squat', level: 3 })).toBeInTheDocument()
  })

  it('empties the builder once the workout is saved', async () => {
    renderApp('/builder')
    await userEvent.click(screen.getByLabelText(t('workoutBuilder.searchLibraryToAddExercise')))
    await userEvent.click(await screen.findByRole('button', { name: /Squat/ }))
    await userEvent.click(screen.getByRole('button', { name: t('workoutBuilder.startWorkout') }))
    await finishAllSets()
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.saveToHistory') }))
    expect(await screen.findByText('landed on /history')).toBeInTheDocument()
    expect(useWorkoutStore.getState().session).toBeNull()
    expect(useWorkoutStore.getState().draft).toEqual({ name: t('workoutBuilder.newWorkout'), items: [] })
  })

  const finishAllSets = async () => {
    for (let i = 0; i < 3; i++) await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.completeSet') }))
  }

  it('shows a summary with sets, exercises and volume', async () => {
    startLogger()
    await finishAllSets()
    expect(screen.getByRole('heading', { name: t('activeWorkout.workoutComplete') })).toBeInTheDocument()
    const summary = screen.getByRole('list')
    expect(within(summary).getByText('100×5 · 100×5')).toBeInTheDocument()
    expect(within(summary).getByText('60×8')).toBeInTheDocument()
    // 2 × 100 × 5 + 60 × 8 = 1480
    expect(screen.getByText('1.5k')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('saves the workout to history', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(0)
    startLogger()
    await finishAllSets()
    vi.mocked(Date.now).mockReturnValue(25 * 60_000)
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.saveToHistory') }))
    expect(await screen.findByText('landed on /history')).toBeInTheDocument()
    expect(vi.mocked(meService.logWorkout).mock.calls[0][0]).toEqual({
      name: 'Push',
      minutes: 25,
      entries: [
        { exerciseId: 1, sets: [{ weight: 100, reps: 5 }, { weight: 100, reps: 5 }] },
        { exerciseId: 2, sets: [{ weight: 60, reps: 8 }] },
      ],
    })
  })

  it('records at least one minute', async () => {
    startLogger({ name: 'Quick', items: [item(squat, 1, 1, 1)] })
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.completeSet') }))
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.saveToHistory') }))
    await waitFor(() => expect(meService.logWorkout).toHaveBeenCalled())
    expect(vi.mocked(meService.logWorkout).mock.calls[0][0].minutes).toBe(1)
  })

  it('keeps the session and asks to log in when saving is unauthorised', async () => {
    vi.mocked(meService.logWorkout).mockRejectedValue(new ApiError('Unauthenticated', 401))
    startLogger({ name: 'Quick', items: [item(squat, 1, 1, 1)] })
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.completeSet') }))
    await userEvent.click(screen.getByRole('button', { name: t('activeWorkout.saveToHistory') }))
    expect(await screen.findByRole('alert')).toHaveTextContent(t('activeWorkout.logInToSaveThisWorkout'))
    expect(screen.getByRole('button', { name: t('activeWorkout.saveToHistory') })).toBeEnabled()
  })
})
