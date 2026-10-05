import { Link, useParams } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { LESSONS } from '../data/learning'
import { Alert, Badge, Card, EmptyState } from '../components/ui'

export default function LearnArticle() {
  const { slug } = useParams()
  const { state, actions, notify } = useApp()
  const lesson = LESSONS.find((item) => item.slug === slug)
  const completed = state.learning?.completed || []
  const isDone = lesson ? completed.includes(lesson.slug) : false

  if (!lesson) {
    return (
      <EmptyState
        emoji="🔍"
        title="Lesson not found"
        message="That lesson does not exist yet."
        action={
          <Link to="/app/learn" className="mw-btn-primary">
            Back to the Learning Hub
          </Link>
        }
      />
    )
  }

  const index = LESSONS.findIndex((item) => item.slug === slug)
  const next = LESSONS[(index + 1) % LESSONS.length]

  return (
    <article className="space-y-4">
      <Link to="/app/learn" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600">
        ← Back to lessons
      </Link>

      <header>
        <div className="flex items-center gap-2">
          <Badge tone={lesson.accent === 'gold' ? 'gold' : lesson.accent === 'risk' ? 'risk' : 'good'}>
            {lesson.tag}
          </Badge>
          <span className="text-xs text-slate-400">{lesson.readTime} read</span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          <span aria-hidden>{lesson.emoji}</span> {lesson.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{lesson.summary}</p>
      </header>

      <div className="space-y-4">
        {lesson.sections.map((section) => (
          <Card key={section.heading}>
            <h2 className="text-base font-extrabold text-slate-900">{section.heading}</h2>
            <div className="mt-2 space-y-2">
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="space-y-1.5">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.note && (
                <div className="rounded-xl border border-gold-200 bg-gold-100/60 px-3 py-2.5 text-xs font-medium leading-relaxed text-gold-900">
                  💡 {section.note}
                </div>
              )}
            </div>
          </Card>
        ))}

        <Card className="border-brand-100 bg-brand-50/50">
          <h2 className="text-sm font-extrabold text-brand-800">Key takeaways</h2>
          <ul className="mt-2 space-y-1.5">
            {lesson.takeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-2 text-sm text-slate-700">
                <span className="text-brand-600">✓</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Alert tone="slate" icon="ℹ️">
          This is general financial education, not personalised financial advice.
        </Alert>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={isDone ? 'mw-btn-secondary flex-1 text-brand-700' : 'mw-btn-primary flex-1'}
            onClick={() => {
              if (isDone) return
              actions.completeLesson(lesson.slug)
              notify('Lesson complete — knowledge score updated')
            }}
            disabled={isDone}
          >
            {isDone ? '✓ Completed' : 'Mark as complete'}
          </button>
          <Link to={`/app/learn/${next.slug}`} className="mw-btn-secondary flex-1">
            Next lesson →
          </Link>
        </div>
      </div>
    </article>
  )
}
