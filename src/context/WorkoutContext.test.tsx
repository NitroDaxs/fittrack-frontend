import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { exercise } from '../test/fixtures'
import { silenceRenderErrors } from '../test/utils'
import type { Routine, RoutineDay } from '../types/routines'
import { WorkoutProvider, useWorkoutDraft } from './WorkoutContext'

const wrapper = ({ children }: { children: ReactNode }) => <WorkoutProvider>{children}</WorkoutProvider>
const setup = () => renderHook(() => useWorkoutDraft(), { wrapper })

const squat = exercise({ id: 1, name: 'Squat', muscleGroups: ['Quads', 'Glutes'] })
const bench = exercise({ id: 2, name: 'Bench' })
const row = exercise({ id: 3, name: 'Row' })

describe('useWorkoutDraft', () => {
  it('throws outside a provider', () => {
    expect(() => silenceRenderErrors(() => renderHook(() => useWorkoutDraft()))).toThrow(/WorkoutProvider/)
  })
})

describe('builder', () => {
  it('starts with an empty, named draft and no session', () => {
    const { result } = setup()
    expect(result.current.draft).toEqual({ name: i18n.t('workoutBuilder.newWorkout'), items: [] })
    expect(result.current.session).toBeNull()
  })

  it('adds exercises with defaults and unique ids', () => {
    const { result } = setup()
    act(() => result.current.addExercise(squat))
    act(() => result.current.addExercise(squat, { sets: 5, reps: 5 }))
    const [first, second] = result.current.draft.items
    expect(first).toMatchObject({ exerciseId: 1, name: 'Squat', tags: ['Quads'], sets: 3, reps: 10, weight: 45 })
    expect(second).toMatchObject({ sets: 5, reps: 5, weight: 45 })
    expect(first.uid).not.toBe(second.uid)
  })

  it('renames, updates and removes items', () => {
    const { result } = setup()
    act(() => result.current.setDraftName('Leg day'))
    act(() => result.current.addExercise(squat))
    act(() => result.current.addExercise(bench))
    const [a, b] = result.current.draft.items
    act(() => result.current.updateItem(a.uid, { weight: '135' }))
    act(() => result.current.removeItem(b.uid))
    expect(result.current.draft.name).toBe('Leg day')
    expect(result.current.draft.items).toHaveLength(1)
    expect(result.current.draft.items[0].weight).toBe('135')
  })

  it('reorders items and ignores out-of-range moves', () => {
    const { result } = setup()
    for (const e of [squat, bench, row]) act(() => result.current.addExercise(e))
    const names = () => result.current.draft.items.map((item) => item.name)

    act(() => result.current.moveItem(0, 2))
    expect(names()).toEqual(['Bench', 'Row', 'Squat'])
    act(() => result.current.moveItem(2, 0))
    expect(names()).toEqual(['Squat', 'Bench', 'Row'])

    const before = result.current.draft
    act(() => result.current.moveItem(1, 1))
    act(() => result.current.moveItem(-1, 0))
    act(() => result.current.moveItem(0, 3))
    expect(result.current.draft).toBe(before)
  })

  it('resets the draft', () => {
    const { result } = setup()
    act(() => result.current.addExercise(squat))
    act(() => result.current.resetDraft())
    expect(result.current.draft.items).toEqual([])
  })

  it('loads a routine day, reading the first number from the rep target', () => {
    const { result } = setup()
    const day: RoutineDay = {
      id: 1,
      name: 'Day 1',
      focus: 'Legs',
      exercises: [
        { exerciseId: 1, exercise: squat, note: null, sets: 5, reps: '5' },
        { exerciseId: 2, exercise: bench, note: null, sets: null, reps: '8-12' },
        { exerciseId: 3, exercise: row, note: null, sets: 4, reps: null },
        { exerciseId: 3, exercise: row, note: null, sets: 2, reps: 'AMRAP' },
      ],
    }
    act(() => result.current.loadRoutineDay({ title: 'Strong 5' } as Routine, day))
    expect(result.current.draft.name).toBe('Strong 5 — Legs')
    expect(result.current.draft.items.map(({ sets, reps, weight }) => ({ sets, reps, weight }))).toEqual([
      { sets: 5, reps: 5, weight: 45 },
      { sets: 3, reps: 8, weight: 45 },
      { sets: 4, reps: 10, weight: 45 },
      { sets: 2, reps: 10, weight: 45 },
    ])
  })
})

describe('session', () => {
  const startWith = (items: { e: typeof squat; sets: number | string; reps?: number | string; weight?: number | string }[]) => {
    const hook = setup()
    for (const { e, ...overrides } of items) act(() => hook.result.current.addExercise(e, overrides))
    let started = false
    act(() => {
      started = hook.result.current.startSession()
    })
    expect(started).toBe(true)
    return hook
  }

  it('will not start an empty workout', () => {
    const { result } = setup()
    let started = true
    act(() => {
      started = result.current.startSession()
    })
    expect(started).toBe(false)
    expect(result.current.session).toBeNull()
  })

  it('starts from the draft with numeric targets', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    const { result } = startWith([
      { e: squat, sets: '4', reps: '6', weight: '225' },
      { e: bench, sets: '', reps: 'x', weight: '' },
    ])
    const session = result.current.session!
    expect(session).toMatchObject({ startedAt: 1_000, exerciseIndex: 0, setIndex: 0, finished: false })
    expect(session.exercises[0]).toMatchObject({ targetSets: 4, reps: 6, weight: 225, logged: [] })
    // Blank or invalid numbers become safe defaults: at least one set, zero weight/reps.
    expect(session.exercises[1]).toMatchObject({ targetSets: 1, reps: 0, weight: 0 })
  })

  it('can start from another draft than the builder', () => {
    const { result } = setup()
    act(() => {
      result.current.startSession({ name: 'Quick', items: [{ ...result.current.draft, uid: 'x', exerciseId: 1, name: 'A', image: '', imageWide: '', icon: 'dumbbell', tags: [], sets: 1, reps: 1, weight: 1 }] })
    })
    expect(result.current.session?.name).toBe('Quick')
  })

  it('adjusts and sets the current exercise values, never below zero', () => {
    const { result } = startWith([{ e: squat, sets: 1, reps: 5, weight: 100 }, { e: bench, sets: 1 }])
    act(() => result.current.adjustCurrent('weight', 5))
    act(() => result.current.adjustCurrent('reps', -10))
    expect(result.current.session!.exercises[0]).toMatchObject({ weight: 105, reps: 0 })
    act(() => result.current.setCurrentValue('weight', '92.5'))
    expect(result.current.session!.exercises[0].weight).toBe(92.5)
    act(() => result.current.setCurrentValue('weight', 'abc'))
    expect(result.current.session!.exercises[0].weight).toBe(0)
    act(() => result.current.setCurrentValue('reps', -3))
    expect(result.current.session!.exercises[0].reps).toBe(0)
    // Only the current exercise changes.
    expect(result.current.session!.exercises[1]).toMatchObject({ weight: 45, reps: 10 })
  })

  it('logs sets, moves to the next exercise and finishes', () => {
    const { result } = startWith([
      { e: squat, sets: 2, reps: 5, weight: 100 },
      { e: bench, sets: 1, reps: 8, weight: 60 },
    ])
    const complete = () => {
      let outcome
      act(() => {
        outcome = result.current.completeSet()
      })
      return outcome
    }

    expect(complete()).toEqual({ type: 'next-set' })
    expect(result.current.session).toMatchObject({ exerciseIndex: 0, setIndex: 1 })

    act(() => result.current.adjustCurrent('weight', 10))
    expect(complete()).toEqual({ type: 'next-exercise' })
    expect(result.current.session).toMatchObject({ exerciseIndex: 1, setIndex: 0 })
    expect(result.current.session!.exercises[0].logged).toEqual([
      { weight: 100, reps: 5 },
      { weight: 110, reps: 5 },
    ])

    expect(complete()).toEqual({ type: 'finished' })
    expect(result.current.session!.finished).toBe(true)
    expect(result.current.session!.exercises[1].logged).toEqual([{ weight: 60, reps: 8 }])

    // A finished session ignores further sets.
    expect(complete()).toEqual({ type: 'next-set' })
    expect(result.current.session!.exercises[1].logged).toHaveLength(1)
  })

  it('completeSet without a session is a no-op', () => {
    const { result } = setup()
    let outcome
    act(() => {
      outcome = result.current.completeSet()
    })
    expect(outcome).toEqual({ type: 'next-set' })
  })

  it('jumps between exercises, resuming at the next unlogged set', () => {
    const { result } = startWith([{ e: squat, sets: 3 }, { e: bench, sets: 3 }])
    act(() => {
      result.current.completeSet()
    })
    act(() => result.current.goToExercise(1))
    expect(result.current.session).toMatchObject({ exerciseIndex: 1, setIndex: 0 })
    act(() => result.current.goToExercise(0))
    expect(result.current.session).toMatchObject({ exerciseIndex: 0, setIndex: 1 })
  })

  it('ends the session', () => {
    const { result } = startWith([{ e: squat, sets: 1 }])
    act(() => result.current.endSession())
    expect(result.current.session).toBeNull()
    // The draft survives.
    expect(result.current.draft.items).toHaveLength(1)
  })

  it('session actions are no-ops without a session', () => {
    const { result } = setup()
    act(() => result.current.adjustCurrent('weight', 5))
    act(() => result.current.setCurrentValue('reps', 5))
    act(() => result.current.goToExercise(1))
    expect(result.current.session).toBeNull()
  })
})
