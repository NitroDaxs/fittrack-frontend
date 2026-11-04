import * as z from 'zod'

export const CHAT_MESSAGE_MAX = 1000

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1).max(CHAT_MESSAGE_MAX),
})

export type ChatMessageValues = z.infer<typeof chatMessageSchema>
