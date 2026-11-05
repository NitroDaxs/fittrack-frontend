// src/store/chat.store.ts
import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type {ChatMessage} from '../types/chat'

/**
 * The assistant chat history. Kept in sessionStorage, so it survives a refresh
 * but not closing the tab, and cleared on logout (see AuthProvider).
 *
 * The history belongs to one user: `userId` records whose it is. Anyone else
 * reads it as empty, and their first message starts a fresh chat in its place.
 */

interface ChatState {
    userId: number | null
    messages: ChatMessage[]
}

interface ChatActions {
    /** The user's message, starting a new chat if the saved one is someone else's. */
    ask: (userId: number, message: ChatMessage) => void
    /** The assistant's answer, dropped if the chat has changed hands since the question. */
    reply: (userId: number, message: ChatMessage) => void
    /** Takes back the last message, after a failed request. */
    dropLast: (userId: number) => void
    clear: () => void
}

export const CHAT_STORAGE_KEY = 'fittrack.chat'

const initialState: ChatState = {userId: null, messages: []}

// One shared empty list, so a selector that finds no messages returns the same value every time.
export const NO_MESSAGES: ChatMessage[] = []

/** Selects the messages only if they belong to `userId`. */
export const selectMessagesFor = (userId: number) => (state: ChatState): ChatMessage[] =>
    state.userId === userId ? state.messages : NO_MESSAGES

export const useChatStore = create<ChatState & ChatActions>()(
    persist(
        (set) => ({
            ...initialState,
            ask: (userId, message) =>
                set((state) => ({
                    userId,
                    messages: state.userId === userId ? [...state.messages, message] : [message],
                })),
            reply: (userId, message) =>
                set((state) => (state.userId === userId ? {messages: [...state.messages, message]} : state)),
            dropLast: (userId) =>
                set((state) => (state.userId === userId ? {messages: state.messages.slice(0, -1)} : state)),
            clear: () => set(initialState),
        }),
        {
            name: CHAT_STORAGE_KEY,
            storage: createJSONStorage(() => sessionStorage),
            version: 1,
            partialize: (state) => ({userId: state.userId, messages: state.messages}),
        },
    ),
)
