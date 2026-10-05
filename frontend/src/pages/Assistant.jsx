import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { STARTER_PROMPTS } from '../utils/assistant'
import { Alert, Badge, Card, PageHeader } from '../components/ui'

function Message({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-md bg-brand-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]'
        }`}
      >
        {!isUser && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand-600">
            🤖 MoneyWise
          </p>
        )}
        <p className="whitespace-pre-line">{message.text || message.reply}</p>

        {message.metrics?.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {message.metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl bg-slate-50 px-2 py-1.5 text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{metric.label}</p>
                <p className="text-xs font-extrabold text-slate-800">{metric.value}</p>
              </div>
            ))}
          </div>
        )}

        {message.suggestions?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {message.suggestions.map((suggestion) => (
              <Link
                key={suggestion.label}
                to={suggestion.to}
                className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 transition hover:bg-brand-100"
              >
                {suggestion.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Assistant() {
  const { state, apiStatus, sendAssistantMessage, actions, notify } = useApp()
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const threadRef = useRef(null)

  const messages = state.assistant || []

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, thinking])

  async function send(text) {
    const question = String(text || '').trim()
    if (!question || thinking) return
    setInput('')
    setThinking(true)
    await sendAssistantMessage(question)
    setThinking(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Assistant"
        title="MoneyWise Assistant"
        description="Ask a money question and get an educational breakdown using your numbers."
        action={
          messages.length > 0 ? (
            <button
              type="button"
              className="mw-btn-secondary shrink-0"
              onClick={() => {
                actions.clearChat()
                notify('Conversation cleared')
              }}
            >
              Clear
            </button>
          ) : null
        }
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={apiStatus === 'online' ? 'good' : 'gold'}>
            {apiStatus === 'online' ? 'API connected' : 'On-device engine'}
          </Badge>
          <span className="text-[11px] text-slate-400">
            {apiStatus === 'online'
              ? 'Answers come from the MoneyWise Flask API.'
              : 'The Flask API is offline, so answers are generated locally.'}
          </span>
        </div>

        <div
          ref={threadRef}
          className="max-h-[52vh] min-h-[320px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
        >
          {messages.length === 0 && (
            <div className="space-y-3">
              <Message
                message={{
                  role: 'assistant',
                  reply:
                    'Hi — I am the MoneyWise assistant. I explain money concepts and help you think through a decision using your own numbers.\n\nTry one of the questions below, or type your own.',
                }}
              />
              <div className="flex flex-wrap gap-1.5 px-1">
                {STARTER_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" className="mw-chip text-left" onClick={() => send(prompt)}>
                    {prompt.length > 52 ? `${prompt.slice(0, 52)}…` : prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 text-xs font-medium text-slate-400">
                Thinking…
              </div>
            </div>
          )}
        </div>

        <Alert tone="slate" icon="ℹ️">
          MoneyWise gives financial education and budgeting support only — it does not give regulated personalised
          financial advice. Never share your passwords or one-time pins.
        </Alert>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          send(input)
        }}
        className="fixed left-0 right-0 bottom-16 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:bottom-0 md:left-60"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            className="mw-input"
            placeholder="e.g. I earn R7,500 and my rent is R3,000 — can I afford a R1,500 contract?"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" className="mw-btn-primary shrink-0" disabled={thinking || !input.trim()}>
            Ask
          </button>
        </div>
        <p className="mx-auto mt-1 hidden max-w-3xl text-[10px] text-slate-400 sm:block">
          Educational analysis only · Your data stays on this device unless the API is connected
        </p>
      </form>
    </>
  )
}
