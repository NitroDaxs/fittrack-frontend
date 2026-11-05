// src/store/workout.store.ts
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import i18n from '../i18n'
import type {AdjustableField, Draft, DraftItem, SetOutcome, WorkoutSession} from '../types/workout'
import type {Exercise} from '../types/exercises'
import type {Routine, RoutineDay} from '../types/routines'

// Holds the workout the user is assembling in the builder and, once started, the
// live logging session. It only reaches the API when the finished session is saved.

interface WorkoutState {
    draft: Draft
    session: WorkoutSession | null
}

interface WorkoutActions {
    setDraftName: (name: string) => void
    addExercise: (exercise: Exercise, overrides?: Partial<DraftItem>) => void
    removeItem: (uid: string) => void
    updateItem: (uid: string, patch: Partial<DraftItem>) => void
    moveItem: (from: number, to: number) => void
    resetDraft: () => void
    loadRoutineDay: (routine: Routine, day: RoutineDay) => void
    startSession: (source?: Draft) => boolean
    completeSet: () => SetOutcome
    adjustCurrent: (field: AdjustableField, delta: number) => void
    setCurrentValue: (field: AdjustableField, value: number | string) => void
    goToExercise: (index: number) => void
    endSession: () => void
    reset: () => void // for logout
}

export const WORKOUT_STORAGE_KEY = 'fittrack.workout'
const STORAGE_VERSION = 1

// The starting values, in one place, so reset() can return to them.
const initialState: WorkoutState = {draft: {name: i18n.t('workoutBuilder.newWorkout'), items: []}, session: null}

const toDraftItem = (exercise: Exercise, overrides: Partial<DraftItem> = {}): DraftItem => ({
    uid: crypto.randomUUID(),
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

export const useWorkoutStore = create<WorkoutState & WorkoutActions>()(
    persist(
        (set, get) => ({
            ...initialState,

            // --- builder ----------------------------------------------------------
            setDraftName: (name) => set((state) => ({draft: {...state.draft, name}})),
            addExercise: (exercise, overrides?) => set((state) => ({
                draft: {
                    ...state.draft,
                    items: [...state.draft.items, toDraftItem(exercise, overrides)]
                }
            })),
            removeItem: (itemUid) => set((state) => ({
                draft: {
                    ...state.draft,
                    items: state.draft.items.filter((item) => item.uid !== itemUid)
                }
            })),
            updateItem: (itemUid, patch) => set((state) => ({
                draft: {
                    ...state.draft,
                    items: state.draft.items.map((item) => (item.uid === itemUid ? {...item, ...patch} : item))
                }
            })),
            moveItem: (from, to) =>
                set((state) => {
                    const current = state.draft.items;
                    if (from === to || from < 0 || to < 0 || from >= current.length || to >= current.length) return state

                    const items = [...current]
                    const [moved] = items.splice(from, 1)
                    items.splice(to, 0, moved)
                    return {draft: {...state.draft, items}}
                }),
            resetDraft: () => set({draft: initialState.draft}),
            /** Seed the builder from a routine day so "Start this routine" is one click. */
            loadRoutineDay: (routine, day) =>
                set({
                    draft: {
                        name: `${routine.title} — ${day.focus}`,
                        items: day.exercises.map((entry) =>
                            toDraftItem(entry.exercise,
                                {
                                    sets: entry.sets ?? 3,
                                    reps: Number(entry.reps?.match(/\d+/)?.[0] ?? 10),
                                    weight: 45
                                }),
                        ),
                    },
                }),

            // --- active session ---------------------------------------------------
            startSession: (source = get().draft) => {
                if (!source.items.length) return false
                set({
                    session: {
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
                    },
                })
                return true
            },
            /**
             * Records the current set and advances. Returns a descriptor of what happened
             * so the logger can decide whether to start the rest timer or show the summary.
             */
            completeSet: () => {
                const session = get().session
                if (!session || session.finished) return {type: 'next-set'}

                const exercises = session.exercises.map((exercise, index) =>
                    index === session.exerciseIndex
                        ? {...exercise, logged: [...exercise.logged, {weight: exercise.weight, reps: exercise.reps}]}
                        : exercise
                )
                const current = exercises[session.exerciseIndex]

                if (current.logged.length < current.targetSets) {
                    set({session: {...session, exercises, setIndex: session.setIndex + 1}})
                    return {type: 'next-set'}
                }
                if (session.exerciseIndex < exercises.length - 1) {
                    set({session: {...session, exercises, exerciseIndex: session.exerciseIndex + 1, setIndex: 0}})
                    return {type: 'next-exercise'}
                }
                set({session: {...session, exercises, finished: true}})
                return {type: 'finished'}
            },
            adjustCurrent: (field, delta) =>
                set((state) => {
                    const session = state.session
                    if (!session) return state

                    const exercises = session.exercises.map((exercise, index) =>
                        index === session.exerciseIndex
                            ? {...exercise, [field]: Math.max(0, (Number(exercise[field]) || 0) + delta)}
                            : exercise
                    )
                    return {session: {...session, exercises}}
                }),
            setCurrentValue: (field, value) =>
                set((state) => {
                    const session = state.session
                    if (!session) return state

                    const exercises = session.exercises.map((exercise, index) =>
                        index === session.exerciseIndex ? {...exercise, [field]: Math.max(0, Number(value) || 0)} : exercise
                    )
                    return {session: {...session, exercises}}
                }),
            goToExercise: (index) =>
                set((state) => {
                    const session = state.session
                    if (!session) return state
                    return {session: {...session, exerciseIndex: index, setIndex: session.exercises[index]?.logged.length ?? 0}}
                }),
            endSession: () => set({session: null}),
            reset: () => set(initialState),
        }),
        {
            name: WORKOUT_STORAGE_KEY, // the localStorage key
            version: STORAGE_VERSION,
            // Only the data is stored; the actions come from the code on every load.
            partialize: (state) => ({draft: state.draft, session: state.session}),
            // Called when the stored version is older than STORAGE_VERSION. Nothing to
            // convert yet: add a step here whenever the shape of draft or session changes.
            migrate: (persistedState, _version) => persistedState as WorkoutState,
        },
    ),
)
