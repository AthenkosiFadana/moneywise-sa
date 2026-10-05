import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { BADGES, CHALLENGES } from '../data/challenges'
import { formatPercent } from '../utils/money'
import { Alert, Badge, Card, PageHeader, ProgressBar, SegmentedTabs } from '../components/ui'

const TONE_COLORS = {
  good: '#279d79',
  watch: '#e0a92b',
  risk: '#e11d48',
}

function ScoreRing({ score }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference
  const color = score >= 75 ? TONE_COLORS.good : score >= 50 ? TONE_COLORS.watch : TONE_COLORS.risk

  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg viewBox="0 0 128 128" className="h-36 w-36 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-black text-slate-900">{score}</p>
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">out of 100</p>
      </div>
    </div>
  )
}

export default function Insights() {
  const { state, confidence, refreshConfidence, actions, notify } = useApp()
  const [tab, setTab] = useState('score')
  const [busy, setBusy] = useState(false)

  async function recalculate() {
    setBusy(true)
    const result = await refreshConfidence()
    setBusy(false)
    notify(result.source === 'api' ? 'Score recalculated via API' : 'Score recalculated locally')
  }

  const earned = useMemo(() => {
    const goals = state.goals || []
    const hasEmergency = goals.find((goal) => goal.emergency)
    return {
      'first-100': goals.some((goal) => Number(goal.saved) >= 100),
      'streak-7': Number(state.challenges?.streak) >= 7,
      'goal-done': goals.some((goal) => Number(goal.target) > 0 && Number(goal.saved) >= Number(goal.target)),
      'emergency-starter': Boolean(hasEmergency && Number(hasEmergency.saved) > 0),
      beginner: (state.learning?.completed || []).length > 0,
    }
  }, [state])

  const activeChallenges = state.challenges?.active || []
  const completedChallenges = state.challenges?.completed || []

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Money Confidence Score"
        description="We measure your habits and knowledge — never your wealth."
        action={
          <button type="button" onClick={recalculate} disabled={busy} className="mw-btn-secondary shrink-0">
            {busy ? 'Calculating…' : 'Recalculate'}
          </button>
        }
      />

      <div className="space-y-4">
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'score', label: 'Confidence score' },
            { id: 'challenges', label: 'Challenges' },
            { id: 'badges', label: 'Badges' },
          ]}
        />

        {tab === 'score' && (
          <>
            <Card>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <ScoreRing score={confidence.overall} />
                <div className="flex-1 text-center sm:text-left">
                  <Badge tone={confidence.level.tone === 'excellent' || confidence.level.tone === 'good' ? 'good' : confidence.level.tone === 'watch' ? 'watch' : 'risk'}>
                    {confidence.level.name}
                  </Badge>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700">{confidence.summary}</p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Updated {new Date(confidence.updated).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            </Card>

            <Card title="Your five pillars" subtitle="Each pillar is scored from your own data">
              <div className="space-y-4">
                {confidence.pillars.map((pillar) => (
                  <div key={pillar.key}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800">
                        <span aria-hidden>{pillar.icon}</span> {pillar.label}
                      </p>
                      <span
                        className="text-sm font-extrabold"
                        style={{ color: TONE_COLORS[pillar.tone] }}
                      >
                        {pillar.score}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <ProgressBar
                        value={pillar.score}
                        tone={pillar.tone === 'good' ? 'brand' : pillar.tone === 'watch' ? 'gold' : 'risk'}
                        height="h-2"
                      />
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                      {pillar.detail} {pillar.neutral && '— add your debts for a fuller picture.'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-brand-100 bg-brand-50/50">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Strongest area</p>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  {confidence.strongest.icon} {confidence.strongest.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{confidence.strongest.tip}</p>
              </Card>
              <Card className="border-gold-200 bg-gold-100/50">
                <p className="text-xs font-bold uppercase tracking-wide text-gold-700">Next opportunity</p>
                <p className="mt-1 text-base font-extrabold text-slate-900">
                  {confidence.weakest.icon} {confidence.weakest.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">{confidence.weakest.tip}</p>
              </Card>
            </div>

            <Alert tone="slate" icon="ℹ️">
              The score is an educational indicator based on the information you enter here. It is not a credit score
              and it is not financial advice.
            </Alert>

            <div className="grid grid-cols-2 gap-2">
              <Link to="/app/learn" className="mw-btn-secondary">
                📚 Learn and score higher
              </Link>
              <Link to="/app/goals" className="mw-btn-secondary">
                🎯 Grow my savings
              </Link>
            </div>
          </>
        )}

        {tab === 'challenges' && (
          <>
            <Card title="Money challenges" subtitle="Small, finishable habits that build real confidence">
              <div className="space-y-3">
                {CHALLENGES.map((challenge) => {
                  const isActive = activeChallenges.includes(challenge.id)
                  const isDone = completedChallenges.includes(challenge.id)

                  return (
                    <div
                      key={challenge.id}
                      className={`rounded-xl border p-3 transition ${
                        isDone ? 'border-brand-200 bg-brand-50/60' : isActive ? 'border-gold-300 bg-gold-100/40' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{challenge.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{challenge.title}</h3>
                            {isDone ? (
                              <Badge tone="good">Done</Badge>
                            ) : isActive ? (
                              <Badge tone="gold">Active</Badge>
                            ) : (
                              <Badge tone="slate">{challenge.duration}</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-500">{challenge.description}</p>
                          <p className="mt-1 text-[11px] text-slate-400">How: {challenge.how}</p>
                          <p className="mt-1.5 text-[11px] font-bold text-gold-700">
                            Reward: {challenge.rewardEmoji} {challenge.reward}
                          </p>

                          <div className="mt-2 flex gap-2">
                            {!isActive && !isDone && (
                              <button
                                type="button"
                                className="mw-btn-secondary py-1.5 text-xs"
                                onClick={() => {
                                  actions.activateChallenge(challenge.id)
                                  notify('Challenge started')
                                }}
                              >
                                Start challenge
                              </button>
                            )}
                            {isActive && (
                              <button
                                type="button"
                                className="mw-btn-primary py-1.5 text-xs"
                                onClick={() => {
                                  actions.completeChallenge(challenge.id)
                                  notify(`Challenge complete — badge unlocked: ${challenge.reward}`)
                                }}
                              >
                                Mark complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card title="Budget streak" subtitle="Days you have stayed on plan">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-black text-brand-600">{state.challenges?.streak || 0}</p>
                <p className="text-xs text-slate-500">
                  days in a row. A 7-day streak unlocks the 📅 budget streak badge.
                </p>
              </div>
            </Card>
          </>
        )}

        {tab === 'badges' && (
          <Card title="Your badges" subtitle="Earned through real habits, not luck">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BADGES.map((badge) => {
                const isEarned = earned[badge.id]
                return (
                  <div
                    key={badge.id}
                    className={`rounded-2xl border p-3 text-center transition ${
                      isEarned ? 'border-gold-300 bg-gold-100/60' : 'border-dashed border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className={`text-2xl ${isEarned ? '' : 'opacity-30 grayscale'}`}>{badge.emoji}</div>
                    <p className={`mt-1 text-xs font-bold ${isEarned ? 'text-slate-900' : 'text-slate-400'}`}>
                      {badge.name}
                    </p>
                    <p className="mt-0.5 text-[10px] leading-tight text-slate-400">
                      {isEarned ? 'Earned 🎉' : badge.hint}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        <Card title="Knowledge check" subtitle="Six questions · improves your knowledge pillar">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {state.learning?.quizBest != null
                  ? `Best score: ${formatPercent(state.learning.quizBest)}`
                  : 'You have not taken the quiz yet'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Lessons completed: {state.learning?.completed?.length || 0} of 7
              </p>
            </div>
            <Link to="/app/learn" className="mw-btn-primary shrink-0">
              Open Learn
            </Link>
          </div>
        </Card>
      </div>
    </>
  )
}
