import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { SA_INCOME_SOURCES, STORAGE_KEY } from '../data/defaults'
import { formatR, parseAmount } from '../utils/money'
import { Alert, Badge, Card, Field, ListRow, PageHeader, StatCard } from '../components/ui'

export default function Profile() {
  const { state, income, confidence, apiStatus, actions, notify } = useApp()

  function exportData() {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'moneywise-sa-data.json'
      anchor.click()
      URL.revokeObjectURL(url)
      notify('Data exported')
    } catch {
      notify('Could not export data', 'error')
    }
  }

  const badgesEarned = [
    state.goals.some((goal) => Number(goal.saved) >= 100),
    Number(state.challenges?.streak) >= 7,
    state.goals.some((goal) => Number(goal.target) > 0 && Number(goal.saved) >= Number(goal.target)),
    state.goals.some((goal) => goal.emergency && Number(goal.saved) > 0),
    (state.learning?.completed || []).length > 0,
  ].filter(Boolean).length

  return (
    <>
      <PageHeader eyebrow="Your account" title="Profile" description="Your details, progress and data controls." />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-xl font-black text-gold-300">
              {(state.profile?.name || 'M').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <input
                className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-lg font-extrabold text-slate-900 outline-none transition hover:border-slate-200 focus:border-brand-400 focus:bg-white"
                value={state.profile?.name || ''}
                onChange={(event) => actions.setProfileField('name', event.target.value)}
                aria-label="Your name"
              />
              <p className="px-1 text-xs text-slate-500">
                {state.profile?.source} · {formatR(income)} a month
              </p>
            </div>
            <Badge tone={apiStatus === 'online' ? 'good' : 'gold'}>
              {apiStatus === 'online' ? 'Live' : 'Local'}
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Monthly income">
              <input
                className="mw-input"
                inputMode="decimal"
                value={state.profile?.income || ''}
                placeholder="R 0"
                onChange={(event) => actions.setProfileField('income', parseAmount(event.target.value))}
              />
            </Field>
            <Field label="Income source">
              <select
                className="mw-input"
                value={state.profile?.source}
                onChange={(event) => actions.setProfileField('source', event.target.value)}
              >
                {SA_INCOME_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Confidence" value={`${confidence.overall}`} hint={confidence.level.name} icon="🧠" tone="gold" />
          <StatCard
            label="Lessons"
            value={`${state.learning?.completed?.length || 0}/7`}
            hint="Completed"
            icon="📚"
            tone="neutral"
          />
          <StatCard label="Badges" value={`${badgesEarned}/5`} hint="Earned" icon="🏅" tone="positive" />
          <StatCard
            label="Streak"
            value={`${state.challenges?.streak || 0}d`}
            hint="Budget days"
            icon="🔥"
            tone="warning"
          />
        </div>

        <Card title="Your data" subtitle="Everything is stored in this browser until the API is connected">
          <div className="divide-y divide-slate-100">
            <ListRow
              icon="📤"
              title="Export my data"
              subtitle="Download a JSON copy of everything you have entered"
              right={
                <button type="button" className="mw-btn-secondary py-1.5 text-xs" onClick={exportData}>
                  Export
                </button>
              }
            />
            <ListRow
              icon="♻️"
              title="Restore sample data"
              subtitle="Bring back the example first-salary budget"
              right={
                <button
                  type="button"
                  className="mw-btn-secondary py-1.5 text-xs"
                  onClick={() => actions.resetDemo()}
                >
                  Restore
                </button>
              }
            />
            <ListRow
              icon="🗑️"
              title="Clear everything"
              subtitle="Remove all income, expenses, goals and progress"
              right={
                <button
                  type="button"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                  onClick={() => {
                    if (window.confirm('Clear all MoneyWise data on this device? This cannot be undone.')) {
                      actions.clearAll()
                    }
                  }}
                >
                  Clear
                </button>
              }
            />
          </div>
          <p className="mt-3 break-all text-[10px] text-slate-400">Storage key: {STORAGE_KEY}</p>
        </Card>

        <Card title="MoneyWise Assistant" subtitle="Financial education in plain language">
          <p className="text-xs leading-relaxed text-slate-500">
            Ask questions like “Can I afford a R1,500 phone contract?” and get an educational breakdown of the ratios
            involved — never a directive to buy or not buy.
          </p>
          <Link to="/app/assistant" className="mw-btn-primary mt-3 w-full">
            Open the assistant
          </Link>
        </Card>

        <Card title="About MoneyWise SA">
          <p className="text-sm font-semibold text-slate-800">
            Building financial confidence, one decision at a time.
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            MoneyWise SA is a digital financial-confidence platform for young South Africans. It helps you understand
            your money, build healthier habits and make more informed decisions.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/" className="mw-chip">
              Landing page
            </Link>
            <Link to="/app/learn" className="mw-chip">
              Learning hub
            </Link>
            <Link to="/app/insights" className="mw-chip">
              Confidence score
            </Link>
          </div>
          <div className="mt-3">
            <Alert tone="gold" icon="⚖️">
              Financial education and budgeting support only. Nothing here is regulated personalised financial,
              investment, credit or tax advice.
            </Alert>
          </div>
        </Card>

        <p className="pb-2 text-center text-[11px] text-slate-400">
          Money Confidence Score {confidence.overall}/100 · {formatR(income)} monthly income
        </p>
      </div>
    </>
  )
}
