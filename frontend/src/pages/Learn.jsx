import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { LESSONS, QUIZ } from '../data/learning'
import { formatPercent } from '../utils/money'
import { Alert, Badge, Card, PageHeader, ProgressBar } from '../components/ui'

function LessonCard({ lesson, completed }) {
  return (
    <Link
      to={`/app/learn/${lesson.slug}`}
      className="mw-card block transition hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-xl">
          {lesson.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={lesson.accent === 'gold' ? 'gold' : lesson.accent === 'risk' ? 'risk' : 'good'}>
              {lesson.tag}
            </Badge>
            {completed && <span className="text-xs font-bold text-brand-600">✓ Done</span>}
          </div>
          <h3 className="mt-1.5 text-sm font-extrabold text-slate-900">{lesson.title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{lesson.summary}</p>
          <p className="mt-2 text-[11px] font-semibold text-slate-400">{lesson.readTime} read</p>
        </div>
      </div>
    </Link>
  )
}

function KnowledgeCheck() {
  const { actions, notify } = useApp()
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    if (!submitted) return null
    const correct = QUIZ.filter((question) => answers[question.id] === question.answer).length
    return Math.round((correct / QUIZ.length) * 100)
  }, [answers, submitted])

  function submit() {
    const answered = Object.keys(answers).length
    if (answered < QUIZ.length) {
      notify(`Answer all ${QUIZ.length} questions first`, 'error')
      return
    }
    setSubmitted(true)
    actions.recordQuizScore(score)
    notify(`Knowledge check: ${score}%`)
  }

  return (
    <Card title="Money knowledge check" subtitle="Six questions · your best score counts towards your confidence score">
      {!submitted ? (
        <div className="space-y-4">
          {QUIZ.map((question, index) => (
            <div key={question.id}>
              <p className="text-sm font-bold text-slate-800">
                <span className="mr-1 text-gold-600">{index + 1}.</span> {question.question}
              </p>
              <div className="mt-2 grid gap-1.5">
                {question.options.map((option, optionIndex) => {
                  const selected = answers[question.id] === optionIndex
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [question.id]: optionIndex })}
                      className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                        selected
                          ? 'border-brand-500 bg-brand-50 text-brand-800'
                          : 'border-slate-200 text-slate-600 hover:border-brand-300'
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <button type="button" onClick={submit} className="mw-btn-primary w-full">
            Check my answers
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-3xl font-black text-brand-700">{formatPercent(score)}</p>
            <p className="mt-1 text-xs text-slate-500">
              {score >= 80 ? 'Excellent — you know your stuff.' : score >= 50 ? 'Good start — review the explanations.' : 'Worth reviewing a lesson or two.'}
            </p>
          </div>

          {QUIZ.map((question) => {
            const correct = answers[question.id] === question.answer
            return (
              <div
                key={question.id}
                className={`rounded-xl border p-3 ${correct ? 'border-brand-100 bg-brand-50/50' : 'border-rose-100 bg-rose-50/50'}`}
              >
                <p className="text-xs font-bold text-slate-800">
                  {correct ? '✅' : '❌'} {question.question}
                </p>
                {!correct && (
                  <p className="mt-1 text-xs text-slate-600">
                    Correct answer: <strong>{question.options[question.answer]}</strong>
                  </p>
                )}
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{question.explain}</p>
              </div>
            )
          })}

          <button
            type="button"
            className="mw-btn-secondary w-full"
            onClick={() => {
              setAnswers({})
              setSubmitted(false)
            }}
          >
            Try again
          </button>
        </div>
      )}
    </Card>
  )
}

export default function Learn() {
  const { state } = useApp()
  const completed = state.learning?.completed || []
  const progress = (completed.length / LESSONS.length) * 100

  return (
    <>
      <PageHeader
        eyebrow="Learning hub"
        title="Understand your money"
        description="Short, practical lessons built around South African realities."
      />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your progress</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {completed.length} of {LESSONS.length} lessons complete
              </p>
            </div>
            <Badge tone={state.learning?.quizBest != null ? 'good' : 'slate'}>
              {state.learning?.quizBest != null
                ? `Quiz ${formatPercent(state.learning.quizBest)}`
                : 'Quiz not taken'}
            </Badge>
          </div>
          <div className="mt-3">
            <ProgressBar value={progress} tone="brand" height="h-2.5" />
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          {LESSONS.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} completed={completed.includes(lesson.slug)} />
          ))}
        </div>

        <KnowledgeCheck />

        <Alert tone="gold" icon="💡">
          Reading a lesson and completing the check both strengthen your Financial knowledge pillar in the Money
          Confidence Score.
        </Alert>
      </div>
    </>
  )
}
