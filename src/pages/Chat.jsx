import { useEffect, useRef, useState } from 'react'
import { chatApi } from '../api/resources'
import { useMutation } from '../api/hooks'
import { ExerciseCard } from '../components/cards'
import Icon from '../components/ui/Icon'

const STARTER_PROMPTS = [
  'What exercises should I do for chest?',
  'Give me some back exercises',
  'What can I do for biceps?',
]

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface-container-lowest border border-surface-variant elev-card rounded-xl rounded-bl-sm px-md py-sm flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" />
      </div>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
      <Icon name="bolt" size={18} filled />
    </div>
  )
}

function ChatBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-sm ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? null : <AssistantAvatar />}
      <div className={`flex flex-col gap-sm ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        <div
          className={
            isUser
              ? 'bg-primary-container text-on-primary rounded-xl rounded-br-sm px-md py-sm font-body-md text-body-md'
              : 'bg-surface-container-lowest border border-surface-variant elev-card rounded-xl rounded-bl-sm px-md py-sm font-body-md text-body-md text-on-surface'
          }
        >
          {message.text}
        </div>

        {message.exercises?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md w-full sm:w-[560px] max-w-full">
            {message.exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const { mutate, pending } = useMutation(chatApi.ask)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, pending])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }])
    setInput('')

    try {
      const res = await mutate(trimmed)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.reply, exercises: res.exercises },
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
    <div className="max-w-[900px] mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <header className="mb-lg">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-sm">
          Ask AI
        </h1>
        <p className="font-body-md text-body-md text-secondary">
          Ask about exercises for a muscle group and get real picks from the library.
        </p>
      </header>

      <div className="bg-surface rounded-xl border border-surface-variant elev-card flex flex-col h-[65vh] min-h-[420px]">
        <div className="flex-grow overflow-y-auto custom-scrollbar px-md md:px-lg py-lg flex flex-col gap-lg">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full gap-md">
              <div className="w-14 h-14 rounded-full bg-primary-fixed text-on-primary-fixed-variant flex items-center justify-center">
                <Icon name="forum" size={28} />
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">
                  What do you want to train today?
                </h2>
                <p className="font-body-md text-body-md text-secondary">
                  Try one of these, or type your own question.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-sm">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="px-md py-sm rounded-full border border-surface-variant bg-surface-container-low text-on-surface font-label-sm text-label-sm hover:border-primary hover:text-primary transition-colors"
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

        <form
          onSubmit={handleSubmit}
          className="border-t border-surface-variant p-md md:p-lg flex items-center gap-sm"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about an exercise..."
            disabled={pending}
            className="flex-grow bg-surface-container-low rounded-lg py-sm px-md ring-1 ring-inset ring-surface-variant focus:ring-2 focus:ring-primary outline-none font-body-md text-on-surface transition-all disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Send message"
            className="w-11 h-11 flex-shrink-0 rounded-lg bg-primary text-on-primary flex items-center justify-center hover:bg-surface-tint transition-colors disabled:opacity-40 disabled:pointer-events-none active:scale-95"
          >
            <Icon name="send" size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
