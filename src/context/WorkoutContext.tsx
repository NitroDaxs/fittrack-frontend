import i18n from '../i18n'
import type { IconName } from '../components/ui/Icon'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Exercise } from '../types/exercises'
import type { LoggedSet } from '../types/me'
import type { Routine, RoutineDay } from '../types/routines'

// Holds the workout the user is assembling in the builder and, once started, the
// live logging session. It only reaches the API when the finished session is saved.

export interface DraftItem {
  uid: string
  exerciseId: number
  name: string
  image: string
  imageWide: string
  icon: IconName
  tags: string[]
  // Strings while being typed into the builder's number inputs.
  sets: number | string
  reps: number | string
  weight: number | string
}

export interface Draft {
  name: string
  items: DraftItem[]
}

export interface SessionExercise extends DraftItem {
  targetSets: number
  weight: number
  reps: number
  logged: LoggedSet[]
}

export interface WorkoutSession {
  name: string
  startedAt: number
  exerciseIndex: number
  setIndex: number
  finished: boolean
  exercises: SessionExercise[]
}

type AdjustableField = 'weight' | 'reps'

export interface SetOutcome {
  type: 'next-set' | 'next-exercise' | 'finished'
}

interface WorkoutContextValue {
  draft: Draft
  setDraftName: (name: string) => void
  addExercise: (exercise: Exercise, overrides?: Partial<DraftItem>) => void
  removeItem: (uid: string) => void
  updateItem: (uid: string, patch: Partial<DraftItem>) => void
  moveItem: (from: number, to: number) => void
  resetDraft: () => void
  loadRoutineDay: (routine: Routine, day: RoutineDay) => void
  session: WorkoutSession | null
  startSession: (source?: Draft) => boolean
  adjustCurrent: (field: AdjustableField, delta: number) => void
  setCurrentValue: (field: AdjustableField, value: number | string) => void
  completeSet: () => SetOutcome
  goToExercise: (index: number) => void
  endSession: () => void
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null)

let uid = 0
const nextUid = () => `item-${++uid}`

const toDraftItem = (exercise: Exercise, overrides: Partial<DraftItem> = {}): DraftItem => ({
  uid: nextUid(),
  exerciseId: exercise.id,
  name: exercise.name,
  image: exercise.image,
  imageWide: exercise.imageWide,
  icon: exercise.icon,
  tags: exercise.muscleGroups.slice(0, 1),
  sets: 3,
  reps: 10,
  weight: 45,
  ...overrides,
})

const emptyDraft: Draft = { name: i18n.t('workoutBuilder.newWorkout'), items: [] }

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [session, setSession] = useState<WorkoutSession | null>(null)

  // --- builder --------------------------------------------------------------

  const setDraftName = useCallback((name: string) => setDraft((d) => ({ ...d, name })), [])

  const addExercise = useCallback((exercise: Exercise, overrides?: Partial<DraftItem>) => {
    setDraft((d) => ({ ...d, items: [...d.items, toDraftItem(exercise, overrides)] }))
  }, [])

  const removeItem = useCallback((itemUid: string) => {
    setDraft((d) => ({ ...d, items: d.items.filter((item) => item.uid !== itemUid) }))
  }, [])

  const updateItem = useCallback((itemUid: string, patch: Partial<DraftItem>) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((item) => (item.uid === itemUid ? { ...item, ...patch } : item)),
    }))
  }, [])

  const moveItem = useCallback((from: number, to: number) => {
    setDraft((d) => {
      if (from === to || from < 0 || to < 0 || from >= d.items.length || to >= d.items.length) return d
      const items = [...d.items]
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)
      return { ...d, items }
    })
  }, [])

  const resetDraft = useCallback(() => setDraft(emptyDraft), [])

  /** Seed the builder from a routine day so "Start this routine" is one click. */
  const loadRoutineDay = useCallback((routine: Routine, day: RoutineDay) => {
    setDraft({
      name: `${routine.title} — ${day.focus}`,
      items: day.exercises
        .map((entry) =>
          toDraftItem(entry.exercise, {
            sets: entry.sets ?? 3,
            reps: Number(entry.reps?.match(/\d+/)?.[0] ?? 10),
            weight: 45,
          })
        ),
    })
  }, [])

  // --- active session -------------------------------------------------------

  const startSession = useCallback((source: Draft = draft) => {
    if (!source.items.length) return false
    setSession({
      name: source.name,
      startedAt: Date.now(),
      exerciseIndex: 0,
      setIndex: 0,
      finished: false,
      exercises: source.items.map((item) => ({
        ...item,
        targetSets: Math.max(1, Number(item.sets) || 1),
        weight: Number(item.weight) || 0,
        reps: Number(item.reps) || 0,
        logged: [],
      })),
    })
    return true
  }, [draft])

  const adjustCurrent = useCallback((field: AdjustableField, delta: number) => {
    setSession((s) => {
      if (!s) return s
      const exercises = s.exercises.map((exercise, index) =>
        index === s.exerciseIndex
          ? { ...exercise, [field]: Math.max(0, (Number(exercise[field]) || 0) + delta) }
          : exercise
      )
      return { ...s, exercises }
    })
  }, [])

  const setCurrentValue = useCallback((field: AdjustableField, value: number | string) => {
    setSession((s) => {
      if (!s) return s
      const exercises = s.exercises.map((exercise, index) =>
        index === s.exerciseIndex ? { ...exercise, [field]: Math.max(0, Number(value) || 0) } : exercise
      )
      return { ...s, exercises }
    })
  }, [])

  /**
   * Records the current set and advances. Returns a descriptor of what happened
   * so the logger can decide whether to start the rest timer or show the summary.
   */
  const completeSet = useCallback((): SetOutcome => {
    // Worked out from the current state rather than inside the updater: updaters
    // run later (and twice under StrictMode), so the caller would read a stale value.
    if (!session || session.finished) return { type: 'next-set' }

    const exercises = session.exercises.map((exercise, index) =>
      index === session.exerciseIndex
        ? { ...exercise, logged: [...exercise.logged, { weight: exercise.weight, reps: exercise.reps }] }
        : exercise
    )
    const current = exercises[session.exerciseIndex]

    if (current.logged.length < current.targetSets) {
      setSession({ ...session, exercises, setIndex: session.setIndex + 1 })
      return { type: 'next-set' }
    }
    if (session.exerciseIndex < exercises.length - 1) {
      setSession({ ...session, exercises, exerciseIndex: session.exerciseIndex + 1, setIndex: 0 })
      return { type: 'next-exercise' }
    }
    setSession({ ...session, exercises, finished: true })
    return { type: 'finished' }
  }, [session])

  const goToExercise = useCallback((index: number) => {
    setSession((s) => (s ? { ...s, exerciseIndex: index, setIndex: s.exercises[index]?.logged.length ?? 0 } : s))
  }, [])

  const endSession = useCallback(() => setSession(null), [])

  const value = useMemo(
    () => ({
      draft,
      setDraftName,
      addExercise,
      removeItem,
      updateItem,
      moveItem,
      resetDraft,
      loadRoutineDay,
      session,
      startSession,
      adjustCurrent,
      setCurrentValue,
      completeSet,
      goToExercise,
      endSession,
    }),
    [
      draft,
      setDraftName,
      addExercise,
      removeItem,
      updateItem,
      moveItem,
      resetDraft,
      loadRoutineDay,
      session,
      startSession,
      adjustCurrent,
      setCurrentValue,
      completeSet,
      goToExercise,
      endSession,
    ]
  )

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
}

export function useWorkoutDraft() {
  const context = useContext(WorkoutContext)
  if (!context) throw new Error('useWorkoutDraft must be used inside a WorkoutProvider')
  return context
}
