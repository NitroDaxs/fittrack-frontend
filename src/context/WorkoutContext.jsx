import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Holds the workout the user is assembling in the builder and, once started, the
// live logging session. All of it is client state -- persisting a session will be
// a POST /me/workouts call against the Laravel API later.

const WorkoutContext = createContext(null)

let uid = 0
const nextUid = () => `item-${++uid}`

const toDraftItem = (exercise, overrides = {}) => ({
  uid: nextUid(),
  exerciseId: exercise.id,
  name: exercise.name,
  image: exercise.image,
  imageWide: exercise.imageWide ?? exercise.image,
  icon: exercise.icon ?? 'fitness_center',
  tags: [exercise.muscleGroups?.[0], exercise.mechanics].filter(Boolean),
  sets: 3,
  reps: 10,
  weight: 45,
  ...overrides,
})

const emptyDraft = { name: 'New Workout', items: [] }

export function WorkoutProvider({ children }) {
  const [draft, setDraft] = useState(emptyDraft)
  const [session, setSession] = useState(null)

  // --- builder --------------------------------------------------------------

  const setDraftName = useCallback((name) => setDraft((d) => ({ ...d, name })), [])

  const addExercise = useCallback((exercise, overrides) => {
    setDraft((d) => ({ ...d, items: [...d.items, toDraftItem(exercise, overrides)] }))
  }, [])

  const removeItem = useCallback((itemUid) => {
    setDraft((d) => ({ ...d, items: d.items.filter((item) => item.uid !== itemUid) }))
  }, [])

  const updateItem = useCallback((itemUid, patch) => {
    setDraft((d) => ({
      ...d,
      items: d.items.map((item) => (item.uid === itemUid ? { ...item, ...patch } : item)),
    }))
  }, [])

  const moveItem = useCallback((from, to) => {
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
  const loadRoutineDay = useCallback((routine, day) => {
    setDraft({
      name: `${routine.title} — ${day.focus}`,
      items: day.exercises
        .filter((entry) => entry.exercise)
        .map((entry) =>
          toDraftItem(entry.exercise, {
            sets: Number(String(entry.sets).match(/\d+/)?.[0] ?? 3),
            reps: Number(String(entry.reps).match(/\d+/)?.[0] ?? 10),
            weight: 45,
          })
        ),
    })
  }, [])

  // --- active session -------------------------------------------------------

  const startSession = useCallback((source = draft) => {
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

  const adjustCurrent = useCallback((field, delta) => {
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

  const setCurrentValue = useCallback((field, value) => {
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
  const completeSet = useCallback(() => {
    let outcome = { type: 'next-set' }
    setSession((s) => {
      if (!s || s.finished) return s
      const exercises = s.exercises.map((exercise, index) =>
        index === s.exerciseIndex
          ? { ...exercise, logged: [...exercise.logged, { weight: exercise.weight, reps: exercise.reps }] }
          : exercise
      )
      const current = exercises[s.exerciseIndex]

      if (current.logged.length < current.targetSets) {
        outcome = { type: 'next-set' }
        return { ...s, exercises, setIndex: s.setIndex + 1 }
      }
      if (s.exerciseIndex < exercises.length - 1) {
        outcome = { type: 'next-exercise' }
        return { ...s, exercises, exerciseIndex: s.exerciseIndex + 1, setIndex: 0 }
      }
      outcome = { type: 'finished' }
      return { ...s, exercises, finished: true }
    })
    return outcome
  }, [])

  const goToExercise = useCallback((index) => {
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
