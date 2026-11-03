import { endpoints } from './endpoints'
import { post } from './http'
import { toArticle } from './articles'
import { toExercise } from './exercises'
import { toRoutine } from './routines'
import type { ChatCards, ChatRequest, ChatResponseDto } from '../types/chat'

export interface ChatAnswer {
  reply: string
  cards: ChatCards
}

export const chatService = {
  ask: (body: ChatRequest): Promise<ChatAnswer> =>
    post<ChatResponseDto>(endpoints.chat, body).then((res) => ({
      reply: res.reply,
      cards: {
        exercises: (res.cards?.exercises ?? []).map(toExercise),
        routines: (res.cards?.routines ?? []).map(toRoutine),
        articles: (res.cards?.articles ?? []).map(toArticle),
      },
    })),
}
