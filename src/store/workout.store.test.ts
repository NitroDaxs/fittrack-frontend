import { describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import { exercise } from '../test/fixtures'
import type { Routine, RoutineDay } from '../types/routines'
import { WORKOUT_STORAGE_KEY, useWorkoutStore } from './workout.store'

// The store is reset before every test in src/test/setup.ts.
const store = () => useWorkoutStore.getState()

const squat = exercise({ id: 1, name: 'Squat', muscleGroups: ['Quads', 'Glutes'] })
const bench = exercise({ id: 2, name: 'Bench' })
const row = exercise({ id: 3, name: 'Row' })

describe('builder', () => {
  it('starts with an empty, named draft and no session', () => {
    expect(store().draft).toEqual({ name: i18n.t('workoutBuilder.newWorkout'), items: [] })
    expect(store().session).toBeNull()
  })

  it('adds exercises with defaults and unique ids', () => {
    store().addExercise(squat)
    store().addExercise(squat, { sets: 5, reps: 5 })
    const [first, second] = store().draft.items
    expect(first).toMatchObject({ exerciseId: 1, name: 'Squat', tags: ['Quads'], sets: 3, reps: 10, weight: 45 })
    expect(second).toMatchObject({ sets: 5, reps: 5, weight: 45 })
    expect(first.uid).not.toBe(second.uid)
  })

  it('renames, updates and removes items', () => {
    store().setDraftName('Leg day')
    store().addExercise(squat)
    store().addExercise(bench)
    const [a, b] = store().draft.items
    store().updateItem(a.uid, { weight: '135' })
    store().removeItem(b.uid)
    expect(store().draft.name).toBe('Leg day')
    expect(store().draft.items).toHaveLength(1)
    expect(store().draft.items[0].weight).toBe('135')
  })

  it('updating an item keeps the draft shape', () => {
    store().setDraftName('Leg day')
    store().addExercise(squat)
    store().updateItem(store().draft.items[0].uid, { reps: 8 })
    expect(Object.keys(store().draft).sort()).toEqual(['items', 'name'])
  })

  it('reorders items and ignores out-of-range moves', () => {
    for (const e of [squat, bench, row]) store().addExercise(e)
    const names = () => store().draft.items.map((item) => item.name)

    store().moveItem(0, 2)
    expect(names()).toEqual(['Bench', 'Row', 'Squat'])
    store().moveItem(2, 0)
    expect(names()).toEqual(['Squat', 'Bench', 'Row'])

    const before = store().draft
    store().moveItem(1, 1)
    store().moveItem(-1, 0)
    store().moveItem(0, -1)
    store().moveItem(0, 3)
    expect(store().draft).toBe(before)
  })

  it('resets the draft and leaves the session alone', () => {
    store().addExercise(squat)
    store().startSession()
    store().resetDraft()
    expect(store().draft).toEqual({ name: i18n.t('workoutBuilder.newWorkout'), items: [] })
    expect(store().session).not.toBeNull()
  })

  it('loads a routine day, reading the first number from the rep target', () => {
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
    store().loadRoutineDay({ title: 'Strong 5' } as Routine, day)
    expect(store().draft.name).toBe('Strong 5 — Legs')
    expect(store().draft.items.map(({ sets, reps, weight }) => ({ sets, reps, weight }))).toEqual([
      { sets: 5, reps: 5, weight: 45 },
      { sets: 3, reps: 8, weight: 45 },
      { sets: 4, reps: 10, weight: 45 },
      { sets: 2, reps: 10, weight: 45 },
    ])
  })
})

describe('session', () => {
  const startWith = (items: { e: typeof squat; sets: number | string; reps?: number | string; weight?: number | string }[]) => {
    for (const { e, ...overrides } of items) store().addExercise(e, overrides)
    expect(store().startSession()).toBe(true)
  }

  it('will not start an empty workout', () => {
    expect(store().startSession()).toBe(false)
    expect(store().session).toBeNull()
  })

  it('starts from the draft with numeric targets', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)
    startWith([
      { e: squat, sets: '4', reps: '6', weight: '225' },
      { e: bench, sets: '', reps: 'x', weight: '' },
    ])
    const session = store().session!
    expect(session).toMatchObject({ startedAt: 1_000, exerciseIndex: 0, setIndex: 0, finished: false })
    expect(session.exercises[0]).toMatchObject({ targetSets: 4, reps: 6, weight: 225, logged: [] })
    // Blank or invalid numbers become safe defaults: at least one set, zero weight/reps.
    expect(session.exercises[1]).toMatchObject({ targetSets: 1, reps: 0, weight: 0 })
  })

  it('can start from another draft than the builder', () => {
    store().startSession({
      name: 'Quick',
      items: [{ uid: 'x', exerciseId: 1, name: 'A', image: '', imageWide: '', icon: 'dumbbell', tags: [], sets: 1, reps: 1, weight: 1 }],
    })
    expect(store().session?.name).toBe('Quick')
  })

  it('adjusts and sets the current exercise values, never below zero', () => {
    startWith([{ e: squat, sets: 1, reps: 5, weight: 100 }, { e: bench, sets: 1 }])
    store().adjustCurrent('weight', 5)
    store().adjustCurrent('reps', -10)
    expect(store().session!.exercises[0]).toMatchObject({ weight: 105, reps: 0 })
    store().setCurrentValue('weight', '92.5')
    expect(store().session!.exercises[0].weight).toBe(92.5)
    store().setCurrentValue('weight', 'abc')
    expect(store().session!.exercises[0].weight).toBe(0)
    store().setCurrentValue('reps', -3)
    expect(store().session!.exercises[0].reps).toBe(0)
    // Only the current exercise changes.
    expect(store().session!.exercises[1]).toMatchObject({ weight: 45, reps: 10 })
  })

  it('logs sets, moves to the next exercise and finishes', () => {
    startWith([
      { e: squat, sets: 2, reps: 5, weight: 100 },
      { e: bench, sets: 1, reps: 8, weight: 60 },
    ])

    expect(store().completeSet()).toEqual({ type: 'next-set' })
    expect(store().session).toMatchObject({ exerciseIndex: 0, setIndex: 1 })

    store().adjustCurrent('weight', 10)
    expect(store().completeSet()).toEqual({ type: 'next-exercise' })
    expect(store().session).toMatchObject({ exerciseIndex: 1, setIndex: 0 })
    expect(store().session!.exercises[0].logged).toEqual([
      { weight: 100, reps: 5 },
      { weight: 110, reps: 5 },
    ])

    expect(store().completeSet()).toEqual({ type: 'finished' })
    expect(store().session!.finished).toBe(true)
    expect(store().session!.exercises[1].logged).toEqual([{ weight: 60, reps: 8 }])

    // A finished session ignores further sets.
    expect(store().completeSet()).toEqual({ type: 'next-set' })
    expect(store().session!.exercises[1].logged).toHaveLength(1)
  })

  it('completeSet without a session is a no-op', () => {
    expect(store().completeSet()).toEqual({ type: 'next-set' })
  })

  it('jumps between exercises, resuming at the next unlogged set', () => {
    startWith([{ e: squat, sets: 3 }, { e: bench, sets: 3 }])
    store().completeSet()
    store().goToExercise(1)
    expect(store().session).toMatchObject({ exerciseIndex: 1, setIndex: 0 })
    store().goToExercise(0)
    expect(store().session).toMatchObject({ exerciseIndex: 0, setIndex: 1 })
  })

  it('ends the session', () => {
    startWith([{ e: squat, sets: 1 }])
    store().endSession()
    expect(store().session).toBeNull()
    // The draft survives.
    expect(store().draft.items).toHaveLength(1)
  })

  it('session actions are no-ops without a session', () => {
    store().adjustCurrent('weight', 5)
    store().setCurrentValue('reps', 5)
    store().goToExercise(1)
    expect(store().session).toBeNull()
  })

  it('reset clears the draft and the session', () => {
    startWith([{ e: squat, sets: 1 }])
    store().reset()
    expect(store().session).toBeNull()
    expect(store().draft.items).toEqual([])
  })
})

describe('persistence', () => {
  it('stores only the draft and the session, at version 1', () => {
    startWithSquat()
    const stored = JSON.parse(localStorage.getItem(WORKOUT_STORAGE_KEY)!)
    expect(stored.version).toBe(1)
    expect(Object.keys(stored.state).sort()).toEqual(['draft', 'session'])
  })

  it('the session survives a store rehydration', async () => {
    startWithSquat()
    store().completeSet()
    const saved = { draft: store().draft, session: store().session }

    // A page reload: a fresh copy of the module builds a new store from localStorage.
    vi.resetModules()
    const { useWorkoutStore: reloaded } = await import('./workout.store')
    expect(reloaded).not.toBe(useWorkoutStore)
    expect(reloaded.persist.hasHydrated()).toBe(true)
    expect(reloaded.getState().session).toEqual(saved.session)
    expect(reloaded.getState().draft).toEqual(saved.draft)
    // The rehydrated store keeps working from where it was.
    expect(reloaded.getState().completeSet()).toEqual({ type: 'next-set' })
    expect(reloaded.getState().session!.exercises[0].logged).toHaveLength(2)
  })

  function startWithSquat() {
    store().addExercise(squat, { sets: 3, reps: 5, weight: 100 })
    store().startSession()
  }
})
