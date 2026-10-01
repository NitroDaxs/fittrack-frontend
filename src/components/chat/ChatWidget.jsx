import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { chatApi } from '../../api/resources'
import { useMutation } from '../../api/hooks'
import { useAuth } from '../../context/AuthContext'
import { useUnits } from '../../context/UnitContext'
import { ArticleCard, ExerciseCard, RoutineCard } from '../cards'
import Icon from '../ui/Icon'

// Members get prompts for their own data; guests only see what they can
// actually get an answer to without an account.
const GUEST_PROMPTS = [
  'Exercises for chest?',
  'A 3-day routine for strength?',
  'Any articles on nutrition?',
]

const MEMBER_PROMPTS = [
  'Dumbbell exercises for shoulders?',
  "What's my best bench press?",
  'How has my weight changed?',
  'Show my recent workouts',
]

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl rounded-bl-sm px-md py-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
      </div>
    </div>
  )
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const { formatWeight } = useUnits()

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col gap-sm ${isUser ? 'items-end' : 'items-start'} max-w-[88%]`}>
        <div
          className={
            isUser
              ? 'bg-primary-container text-on-primary rounded-xl rounded-br-sm px-sm py-xs font-body-md text-sm'
              : 'bg-surface-container-lowest border border-surface-variant rounded-xl rounded-bl-sm px-sm py-xs font-body-md text-sm text-on-surface'
          }
        >
          {message.text}
        </div>

        {message.exercises?.length ? (
          <div className="grid grid-cols-1 gap-sm w-fullnp">
            {message.exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        ) : null}

        {message.routines?.length ? (
          <div className="grid grid-cols-1 gap-sm w-full">
            {message.routines.map((routine) => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </div>
        ) : null}

        {message.articles?.length ? (
          <div className="grid grid-cols-1 gap-sm w-full">
            {message.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : null}

        {message.workouts?.length ? (
          <div className="flex flex-col gap-xs w-full">
            {message.workouts.map((w) => (
              <Link
                key={w.id}
                to="/history"
                className="flex justify-between items-center gap-sm bg-surface-container-lowest border border-surface-variant rounded-lg px-sm py-xs text-sm hover:border-primary transition-colors"
              >
                <span className="font-label-bold truncate">{w.name}</span>
                <span className="text-secondary flex-shrink-0">
                  {new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  {w.durationMinutes ? ` · ${w.durationMinutes}m` : ''}
                </span>
              </Link>
            ))}
          </div>
        ) : null}

        {message.measurements?.length ? (
          <div className="flex flex-col gap-xs w-full">
            {message.measurements.map((m) => (
              <div
                key={m.id}
                className="flex justify-between bg-surface-container-lowest border border-surface-variant rounded-lg px-sm py-xs text-sm"
              >
                <span className="text-secondary">
                  {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="font-label-bold flex gap-sm">
                  {m.weight != null ? <span>{formatWeight(m.weight)}</span> : null}
                  {m.bodyFat != null ? <span>{m.bodyFat}% BF</span> : null}
                  {m.weight == null && m.bodyFat == null ? <span>—</span> : null}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {message.authRequired ? (
          <div className="flex gap-xs w-full">
            <Link
              to="/login"
              className="flex-1 text-center font-label-bold text-label-sm border border-outline text-on-surface px-sm py-xs rounded-lg hover:bg-surface-container transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center font-label-bold text-label-sm bg-primary-container text-on-primary px-sm py-xs rounded-lg hover:bg-primary transition-colors"
            >
              Sign up free
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const { mutate, pending } = useMutation(chatApi.ask)
  const { isAuthenticated } = useAuth()
  const bottomRef = useRef(null)

  const starters = isAuthenticated ? MEMBER_PROMPTS : GUEST_PROMPTS

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending, open])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')

    try {
      const res = await mutate(trimmed)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          exercises: res.exercises,
          routines: res.routines,
          articles: res.articles,
          workouts: res.workouts,
          measurements: res.measurements,
          authRequired: res.authRequired,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "Something went wrong on my end -- try that again.", exercises: [] },
      ])
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="fixed z-[95] bottom-20 md:bottom-lg right-md flex flex-col items-end gap-sm print:hidden">
      {open ? (
        <div className="bg-surface rounded-xl border border-surface-variant elev-overlay flex flex-col w-[92vw] max-w-[380px] h-[70vh] max-h-[560px] overflow-hidden">
          <div className="flex items-center justify-between px-md py-sm border-b border-surface-variant bg-surface-container-low flex-shrink-0">
            <div className="flex items-center gap-sm">
              <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <Icon name="bolt" size={16} filled />
              </div>
              <span className="font-headline-md text-headline-md text-on-surface" style={{ fontSize: '15px' }}>
                Ask AI
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-secondary hover:text-on-surface p-xs rounded-full hover:bg-surface-container transition-colors"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto custom-scrollbar px-sm py-md flex flex-col gap-md">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-full gap-sm px-sm">
                <div className="w-11 h-11 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center">
                  <Icon name="forum" size={22} />
                </div>
                <p className="font-body-md text-sm text-secondary">
                  {isAuthenticated
                    ? 'Ask about exercises, routines, or your own training data.'
                    : 'Ask about exercises, routines, or articles.'}
                </p>
                <div className="flex flex-col gap-xs w-full">
                  {starters.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="px-sm py-xs rounded-lg border border-surface-variant bg-surface-container-low text-on-surface font-label-sm text-label-sm hover:border-primary hover:text-primary transition-colors text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, i) => (
                  <ChatBubble key={i} message={message} />
                ))}
                {pending ? <TypingBubble /> : null}
              </>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-surface-variant p-sm flex items-center gap-xs flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an exercise..."
              disabled={pending}
              className="flex-grow bg-surface-container-low rounded-lg py-xs px-sm text-sm ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-body-md text-on-surface transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 flex-shrink-0 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-surface-tint transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            >
              <Icon name="send" size={18} />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open AI chat'}
        className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center elev-overlay active:scale-95 transition-transform"
      >
        <Icon name={open ? 'close' : 'forum'} size={26} filled={!open} />
      </button>
    </div>
  )
}
