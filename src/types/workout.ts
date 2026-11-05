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

export interface WorkoutSession {
    name: string
    startedAt: number
    exerciseIndex: number
    setIndex: number
    finished: boolean
    exercises: SessionExercise[]
}

export type AdjustableField = 'weight' | 'reps'

export interface SetOutcome {
    type: 'next-set' | 'next-exercise' | 'finished'
}
