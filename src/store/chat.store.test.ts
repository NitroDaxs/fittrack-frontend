import { describe, expect, it, vi } from 'vitest'
import type { ChatMessage } from '../types/chat'
import { CHAT_STORAGE_KEY, NO_MESSAGES, selectMessagesFor, useChatStore } from './chat.store'

const store = () => useChatStore.getState()
const msg = (role: ChatMessage['role'], content: string): ChatMessage => ({ id: `${role}-${content}`, role, content })
const contents = (userId: number) => selectMessagesFor(userId)(store()).map((m) => m.content)

describe('chat store', () => {
  it('keeps a conversation for its user', () => {
    store().ask(1, msg('user', 'Hi'))
    store().reply(1, msg('assistant', 'Hello!'))
    expect(contents(1)).toEqual(['Hi', 'Hello!'])
  })

  it('shows another user nothing, and their first message starts a fresh chat', () => {
    store().ask(1, msg('user', 'Mine'))
    expect(selectMessagesFor(2)(store())).toBe(NO_MESSAGES)

    store().ask(2, msg('user', 'Theirs'))
    expect(contents(2)).toEqual(['Theirs'])
    expect(selectMessagesFor(1)(store())).toBe(NO_MESSAGES)
  })

  it("drops a reply or a take-back meant for someone else's chat", () => {
    store().ask(1, msg('user', 'Question'))
    store().ask(2, msg('user', 'Other'))
    store().reply(1, msg('assistant', 'Late answer'))
    store().dropLast(1)
    expect(contents(2)).toEqual(['Other'])
  })

  it('takes back the last message', () => {
    store().ask(1, msg('user', 'One'))
    store().ask(1, msg('user', 'Two'))
    store().dropLast(1)
    expect(contents(1)).toEqual(['One'])
  })

  it('clears', () => {
    store().ask(1, msg('user', 'Hi'))
    store().clear()
    expect(store()).toMatchObject({ userId: null, messages: [] })
  })

  it('is saved in sessionStorage, not localStorage', () => {
    store().ask(1, msg('user', 'Hi'))
    expect(JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY)!).state).toEqual({ userId: 1, messages: [msg('user', 'Hi')] })
    expect(localStorage.getItem(CHAT_STORAGE_KEY)).toBeNull()
  })

  it('survives a refresh', async () => {
    store().ask(1, msg('user', 'Hi'))
    store().reply(1, msg('assistant', 'Hello!'))

    vi.resetModules()
    const { useChatStore: reloaded } = await import('./chat.store')
    expect(reloaded.getState()).toMatchObject({ userId: 1, messages: [msg('user', 'Hi'), msg('assistant', 'Hello!')] })
  })
})
