import type {IconName} from "../components/ui/Icon";
import type {LoggedSet} from "./me";

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

/**
 * The rest countdown between sets. Stored as times rather than a ticking number,
 * so it keeps counting while the logger is closed and across reloads.
 * Running: endsAt is set. Paused: endsAt is null and pausedMs is the time left.
 * Idle: endsAt is null and pausedMs is 0. A running timer whose endsAt has passed
 * has simply run out.
 */
export interface RestTimer {
    endsAt: number | null
    pausedMs: number
}

export interface WorkoutSession {
    name: string
    startedAt: number
    exerciseIndex: number
    setIndex: number
    finished: boolean
    exercises: SessionExercise[]
    rest: RestTimer
}

export type AdjustableField = 'weight' | 'reps'

export interface SetOutcome {
    type: 'next-set' | 'next-exercise' | 'finished'
}
