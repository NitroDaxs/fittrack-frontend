import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import type { ChatAnswer } from '../../services/chat'
import { exercise } from '../../test/fixtures'
import { renderWithProviders } from '../../test/utils'
import ChatBubble from './ChatBubble'

vi.mock('../../services/chat', () => ({ chatService: { ask: vi.fn() } }))
const { chatService } = await import('../../services/chat')
const t = (key: string) => i18n.t(key)

const answer = (reply: string, cards: Partial<ChatAnswer['cards']> = {}): ChatAnswer => ({
  reply,
  cards: { exercises: [], routines: [], articles: [], ...cards },
})

const open = () => userEvent.click(screen.getByRole('button', { name: t('chat.open') }))
const input = () => screen.getByRole('textbox', { name: t('chat.placeholder') })

beforeEach(() => {
  vi.mocked(chatService.ask).mockReset().mockResolvedValue(answer('Hello!'))
})

afterEach(async () => {
  await i18n.changeLanguage('en')
})

describe('ChatBubble', () => {
  it('opens and closes the panel', async () => {
    renderWithProviders(<ChatBubble userId={1} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await open()
    expect(screen.getByRole('dialog', { name: t('chat.title') })).toBeInTheDocument()
    expect(input()).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await open()
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: t('chat.close') }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('sends with Enter, keeps Shift+Enter for new lines, and shows the reply', async () => {
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), 'Hi{Shift>}{Enter}{/Shift}there')
    expect(input()).toHaveValue('Hi\nthere')
    await userEvent.keyboard('{Enter}')

    expect(await screen.findByText('Hello!')).toBeInTheDocument()
    expect(screen.getByText('Hi there', { normalizer: (s) => s.replace(/\s+/g, ' ') })).toBeInTheDocument()
    expect(input()).toHaveValue('')
    expect(chatService.ask).toHaveBeenCalledWith({ message: 'Hi\nthere', history: [], language: 'en' })
  })

  it('ignores blank messages', async () => {
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), '   {Enter}')
    await userEvent.click(screen.getByRole('button', { name: t('chat.send') }))
    expect(chatService.ask).not.toHaveBeenCalled()
  })

  it('sends a suggestion and includes earlier turns as history', async () => {
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.click(screen.getByRole('button', { name: t('chat.suggestion1') }))
    await screen.findByText('Hello!')

    vi.mocked(chatService.ask).mockResolvedValue(answer('Second'))
    await userEvent.type(input(), 'More{Enter}')
    await screen.findByText('Second')
    expect(vi.mocked(chatService.ask).mock.calls[1][0].history).toEqual([
      { role: 'user', content: t('chat.suggestion1') },
      { role: 'assistant', content: 'Hello!' },
    ])
  })

  it('asks in Bulgarian when the app is in Bulgarian', async () => {
    await i18n.changeLanguage('bg')
    renderWithProviders(<ChatBubble userId={1} />)
    await userEvent.click(screen.getByRole('button', { name: i18n.t('chat.open') }))
    await userEvent.type(screen.getByRole('textbox'), 'Здрасти{Enter}')
    await waitFor(() => expect(chatService.ask).toHaveBeenCalledWith(expect.objectContaining({ language: 'bg' })))
  })

  it('renders bold text and lists in replies', async () => {
    vi.mocked(chatService.ask).mockResolvedValue(answer('## Plan\n**Day 1** focus\n- Squat\n- Bench\n1. Warm up\n2) Lift'))
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), 'plan{Enter}')
    expect(await screen.findByText('Day 1')).toContainHTML('<strong>Day 1</strong>')
    expect(screen.getByText('Plan').tagName).toBe('P')
    const lists = within(screen.getByRole('dialog')).getAllByRole('list')
    expect(lists.map((list) => list.tagName)).toEqual(['UL', 'OL'])
    expect(within(lists[0]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Squat', 'Bench'])
    expect(within(lists[1]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Warm up', 'Lift'])
  })

  it('links to suggested content and closes when one is followed', async () => {
    vi.mocked(chatService.ask).mockResolvedValue(answer('Try this', { exercises: [exercise({ slug: 'bench-press', name: 'Bench Press' })] }))
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), 'chest{Enter}')
    const link = await screen.findByRole('link', { name: /Bench Press/ })
    expect(link).toHaveAttribute('href', '/library/bench-press')
    await userEvent.click(link)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a failure, removes the failed message and retries it', async () => {
    vi.mocked(chatService.ask).mockRejectedValueOnce(new Error('Assistant unavailable'))
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), 'Hello?{Enter}')

    expect(await screen.findByRole('alert')).toHaveTextContent('Assistant unavailable')
    expect(screen.queryByText('Hello?')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: t('ui.tryAgain') }))
    expect(await screen.findByText('Hello!')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(chatService.ask).toHaveBeenCalledTimes(2)
    expect(vi.mocked(chatService.ask).mock.calls[1][0].message).toBe('Hello?')
  })

  it('keeps the conversation when the bubble is mounted again, as after a refresh', async () => {
    const { unmount } = renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), 'Hi{Enter}')
    await screen.findByText('Hello!')
    unmount()

    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    expect(screen.getByText('Hi')).toBeInTheDocument()
    expect(screen.getByText('Hello!')).toBeInTheDocument()
  })

  it("never shows one user another user's chat", async () => {
    const { unmount } = renderWithProviders(<ChatBubble userId={1} />)
    await open()
    await userEvent.type(input(), 'My secret{Enter}')
    await screen.findByText('Hello!')
    unmount()

    renderWithProviders(<ChatBubble userId={2} />)
    await open()
    expect(screen.queryByText('My secret')).not.toBeInTheDocument()
    expect(screen.getByText(t('chat.intro'))).toBeInTheDocument()

    // Nor is it sent as their history.
    await userEvent.type(input(), 'Hi{Enter}')
    await screen.findByText('Hello!')
    expect(vi.mocked(chatService.ask).mock.calls[1][0].history).toEqual([])
  })

  it('starts a new chat', async () => {
    renderWithProviders(<ChatBubble userId={1} />)
    await open()
    expect(screen.queryByRole('button', { name: t('chat.newChat') })).not.toBeInTheDocument()
    await userEvent.type(input(), 'Hi{Enter}')
    await screen.findByText('Hello!')
    await userEvent.click(screen.getByRole('button', { name: t('chat.newChat') }))
    expect(screen.queryByText('Hello!')).not.toBeInTheDocument()
    expect(screen.getByText(t('chat.intro'))).toBeInTheDocument()
  })
})
