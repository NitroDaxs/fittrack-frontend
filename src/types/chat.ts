import type { Article, ArticleDto } from './articles'
import type { Exercise, ExerciseDto } from './exercises'
import type { Routine, RoutineDto } from './routines'

export type ChatRole = 'user' | 'assistant'

export interface ChatTurnDto {
  role: ChatRole
  content: string
}

export interface ChatRequest {
  message: string
  history: ChatTurnDto[]
  language: 'en' | 'bg'
}

export interface ChatResponseDto {
  reply: string
  cards: {
    exercises: ExerciseDto[]
    routines: RoutineDto[]
    articles: ArticleDto[]
  }
}

export interface ChatCards {
  exercises: Exercise[]
  routines: Routine[]
  articles: Article[]
}

export interface ChatMessage {
  id: number
  role: ChatRole
  content: string
  cards?: ChatCards
}
