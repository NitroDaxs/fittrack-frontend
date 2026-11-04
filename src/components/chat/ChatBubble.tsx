import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import Img from '../ui/Img'
import { chatService } from '../../services/chat'
import { errorMessage } from '../../services/http'
import type { ChatCards, ChatMessage } from '../../types/chat'
import { CHAT_MESSAGE_MAX, chatMessageSchema, type ChatMessageValues } from '../../schemas/chat.schema'

// The API accepts up to 40 turns; it only reads the last few, so send fewer.
const HISTORY_TURNS = 12

let nextId = 1

/** Floating assistant button and chat panel, shown to logged-in users. */
export default function ChatBubble() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const { register, handleSubmit, setValue, setFocus } = useForm<ChatMessageValues>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: { message: '' },
  })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<{ text: string; message: string } | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) setFocus('message')
  }, [open, setFocus])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending, error])

  useEffect(() => {
    if (!open) return
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function send(text: string) {
    const message = text.trim()
    if (!message || pending) return

    const history = messages.slice(-HISTORY_TURNS).map(({ role, content }) => ({ role, content }))
    setMessages((current) => [...current, { id: nextId++, role: 'user', content: message }])
    setValue('message', '')
    setError(null)
    setPending(true)

    try {
      const answer = await chatService.ask({
        message,
        history,
        language: i18n.resolvedLanguage === 'bg' ? 'bg' : 'en',
      })
      setMessages((current) => [
        ...current,
        { id: nextId++, role: 'assistant', content: answer.reply, cards: answer.cards },
      ])
    } catch (caught) {
      // Take the failed message back out so "try again" doesn't send it twice.
      setMessages((current) => current.slice(0, -1))
      setError({ text: message, message: errorMessage(caught) })
    } finally {
      setPending(false)
    }
  }

  // The schema only lets through a non-blank message within the API's length limit.
  const onSubmit = handleSubmit(({ message }) => send(message))

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void onSubmit()
    }
  }

  function reset() {
    setMessages([])
    setError(null)
    setValue('message', '')
  }

  const suggestions = [t('chat.suggestion1'), t('chat.suggestion2'), t('chat.suggestion3')]

  return (
    <>
      {open ? (
        <section
          role="dialog"
          aria-label={t('chat.title')}
          className="fixed z-50 inset-x-4 top-24 bottom-20 md:inset-x-auto md:top-auto md:right-6 md:bottom-24 md:w-96 md:h-[34rem] flex flex-col bg-surface rounded-xl border border-surface-variant shadow-[0px_12px_40px_rgba(0,0,0,0.18)] overflow-hidden"
        >
          <header className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary">
            <Icon name="sparkles" size={20} />
            <div className="flex-grow min-w-0">
              <h2 className="font-label-bold text-base leading-tight">{t('chat.title')}</h2>
              <p className="text-xs opacity-80 truncate">{t('chat.subtitle')}</p>
            </div>
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={reset}
                className="p-xs rounded-full hover:bg-white/15 transition-colors"
                aria-label={t('chat.newChat')}
                title={t('chat.newChat')}
              >
                <Icon name="rotate-ccw" size={18} />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-xs rounded-full hover:bg-white/15 transition-colors"
              aria-label={t('chat.close')}
            >
              <Icon name="x" size={20} />
            </button>
          </header>

          <div ref={listRef} className="flex-grow overflow-y-auto px-md py-md space-y-md bg-surface-container-lowest" aria-live="polite">
            {messages.length === 0 && !pending ? (
              <div className="text-center text-secondary pt-md">
                <Icon name="sparkles" size={32} className="text-primary mb-sm" />
                <p className="font-body-md text-sm mb-md">{t('chat.intro')}</p>
                <div className="flex flex-col gap-xs">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void send(suggestion)}
                      className="text-left text-sm px-sm py-xs rounded-lg border border-outline-variant text-on-surface hover:border-primary hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <p className="max-w-[85%] bg-primary text-on-primary rounded-2xl rounded-br-sm px-sm py-xs text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
              ) : (
                <div key={message.id} className="flex flex-col items-start gap-xs">
                  <div className="max-w-[90%] bg-surface-container text-on-surface rounded-2xl rounded-bl-sm px-sm py-xs text-sm break-words space-y-1">
                    <FormattedText text={message.content} />
                  </div>
                  {message.cards ? <ChatCardList cards={message.cards} onNavigate={() => setOpen(false)} /> : null}
                </div>
              ),
            )}

            {pending ? (
              <div className="flex items-center gap-1 bg-surface-container rounded-2xl rounded-bl-sm px-sm py-sm w-fit" aria-label={t('chat.thinking')}>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
              </div>
            ) : null}

            {error ? (
              <div className="flex items-start gap-xs text-sm text-error bg-error-container/40 rounded-lg px-sm py-xs" role="alert">
                <Icon name="circle-alert" size={16} className="mt-0.5" />
                <div className="flex-grow">
                  <p>{error.message}</p>
                  <button type="button" onClick={() => void send(error.text)} className="font-label-bold underline mt-1">
                    {t('ui.tryAgain')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="flex items-end gap-xs p-sm border-t border-surface-variant bg-surface">
            <textarea
              maxLength={CHAT_MESSAGE_MAX}
              {...register('message')}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={t('chat.placeholder')}
              aria-label={t('chat.placeholder')}
              className="flex-grow resize-none max-h-32 rounded-lg border border-outline-variant bg-surface-container-lowest px-sm py-xs text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={pending}
              className="shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-primary text-on-primary disabled:opacity-40 transition-opacity"
              aria-label={t('chat.send')}
            >
              <Icon name="send" size={18} />
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed z-50 right-4 bottom-20 md:right-6 md:bottom-6 h-14 w-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0px_8px_24px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-transform"
        aria-label={open ? t('chat.close') : t('chat.open')}
        aria-expanded={open}
      >
        <Icon name={open ? 'x' : 'message-circle'} size={26} />
      </button>
    </>
  )
}

function ChatCardList({ cards, onNavigate }: { cards: ChatCards; onNavigate: () => void }) {
  const items = [
    ...cards.exercises.map((e) => ({ key: `e${e.id}`, to: `/library/${e.slug}`, title: e.name, meta: e.primaryMuscles, image: e.image, icon: e.icon })),
    ...cards.routines.map((r) => ({ key: `r${r.id}`, to: `/routines/${r.slug}`, title: r.title, meta: `${r.goal} · ${r.level}`, image: r.image, icon: r.icon })),
    ...cards.articles.map((a) => ({ key: `a${a.id}`, to: `/articles/${a.slug}`, title: a.title, meta: a.category, image: a.image, icon: 'file-text' as const })),
  ]
  if (items.length === 0) return null

  return (
    <ul className="w-full space-y-xs">
      {items.map((item) => (
        <li key={item.key}>
          <Link
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-sm p-xs rounded-lg border border-surface-variant bg-surface hover:border-primary transition-colors group"
          >
            <div className="h-12 w-16 shrink-0 rounded overflow-hidden bg-surface-container-highest">
              <Img src={item.image} alt="" icon={item.icon} imgClassName="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-grow">
              <p className="text-sm font-label-bold text-on-surface truncate group-hover:text-primary">{item.title}</p>
              <p className="text-xs text-secondary truncate">{item.meta}</p>
            </div>
            <Icon name="chevron-right" size={16} className="text-secondary" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/** Renders the little Markdown models tend to use: **bold**, bullet and numbered lists. */
function FormattedText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null

  const flush = () => {
    if (!list) return
    const Tag = list.ordered ? 'ol' : 'ul'
    blocks.push(
      <Tag key={blocks.length} className={`${list.ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-0.5`}>
        {list.items.map((item, index) => (
          <li key={index}>{inline(item)}</li>
        ))}
      </Tag>,
    )
    list = null
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    const bullet = line.match(/^[-*•]\s+(.*)$/)
    const numbered = line.match(/^\d+[.)]\s+(.*)$/)
    if (bullet || numbered) {
      const ordered = Boolean(numbered)
      if (list && list.ordered !== ordered) flush()
      list ??= { ordered, items: [] }
      list.items.push((bullet ?? numbered)![1])
      continue
    }
    flush()
    if (line) blocks.push(<p key={blocks.length}>{inline(line.replace(/^#+\s*/, ''))}</p>)
  }
  flush()

  return <>{blocks}</>
}

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part,
  )
}
