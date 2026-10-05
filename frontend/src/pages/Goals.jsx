import { useState } from 'react'
import { useApp } from '../store/useApp'
import { GOAL_PRESETS } from '../data/defaults'
import { savingsProjection } from '../utils/calculations'
import { formatR, parseAmount } from '../utils/money'
import { Alert, Badge, Card, EmptyState, Field, Modal, PageHeader, ProgressBar } from '../components/ui'

const QUICK_AMOUNTS = [100, 200, 500]

export default function Goals() {
  const { state, actions, notify } = useApp()
  const [modal, setModal] = useState(null)
  const [contributing, setContributing] = useState(null)
  const [amount, setAmount] = useState('')
  const [form, setForm] = useState({
    name: '',
    emoji: '🎯',
    target: '',
    saved: '',
    monthly: '',
    emergency: false,
  })

  function openNew() {
    setForm({ name: '', emoji: '🎯', target: '', saved: '', monthly: '', emergency: false })
    setModal('new')
  }

  function saveGoal(event) {
    event.preventDefault()
    const target = parseAmount(form.target)
    if (!form.name.trim() || target <= 0) {
      notify('Give your goal a name and a target amount', 'error')
      return
    }
    actions.addGoal({
      name: form.name.trim(),
      emoji: form.emoji,
      target,
      saved: parseAmount(form.saved),
      monthly: parseAmount(form.monthly),
      emergency: form.emergency,
      coverMonths: form.emergency ? 3 : undefined,
    })
    setModal(null)
    notify('Goal created')
  }

  function submitContribution(event) {
    event.preventDefault()
    const value = parseAmount(amount)
    if (value <= 0) {
      notify('Enter an amount greater than R0', 'error')
      return
    }
    actions.contributeToGoal(contributing.id, value)
    setContributing(null)
    setAmount('')
    notify(`Added ${formatR(value)} to ${contributing.name}`)
  }

  const goals = state.goals || []
  const totalSaved = goals.reduce((sum, goal) => sum + (Number(goal.saved) || 0), 0)
  const totalTarget = goals.reduce((sum, goal) => sum + (Number(goal.target) || 0), 0)

  return (
    <>
      <PageHeader
        eyebrow="Save with a plan"
        title="Savings goals"
        description="Every goal needs a target, a date and a monthly contribution."
        action={
          <button type="button" onClick={openNew} className="mw-btn-primary shrink-0">
            + Goal
          </button>
        }
      />

      <div className="space-y-4">
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Saved so far</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-700">{formatR(totalSaved)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Across all goals</p>
              <p className="mt-1 text-sm font-bold text-slate-600">{formatR(totalTarget)}</p>
            </div>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
              tone="brand"
              height="h-2.5"
            />
          </div>
        </Card>

        {goals.length === 0 ? (
          <EmptyState
            emoji="🎯"
            title="No goals yet"
            message="A goal could be your first R1,000 emergency fund, a new phone or a deposit for a car."
            action={
              <button type="button" onClick={openNew} className="mw-btn-primary">
                Create a goal
              </button>
            }
          />
        ) : (
          goals.map((goal) => {
            const projection = savingsProjection({
              target: goal.target,
              current: goal.saved,
              monthly: goal.monthly,
            })
            const progress = projection.progress ?? 0
            const complete = progress >= 100

            return (
              <Card key={goal.id} className={complete ? 'border-brand-200 bg-brand-50/40' : ''}>
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-xl">
                    {goal.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="truncate text-sm font-extrabold text-slate-900">{goal.name}</h2>
                      {complete ? <Badge tone="good">Complete</Badge> : goal.emergency ? <Badge tone="gold">Buffer</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatR(goal.saved)} of {formatR(goal.target)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <ProgressBar value={progress} tone={complete ? 'brand' : 'gold'} height="h-2.5" />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Progress</p>
                    <p className="text-sm font-extrabold text-slate-800">{Math.round(progress)}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Per month</p>
                    <p className="text-sm font-extrabold text-slate-800">{formatR(goal.monthly)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Time left</p>
                    <p className="text-sm font-extrabold text-slate-800">
                      {complete ? 'Done' : projection.valid ? projection.monthsLabel : '—'}
                    </p>
                  </div>
                </div>

                {!complete && !projection.valid && (
                  <div className="mt-3">
                    <Alert tone="info" icon="💡">
                      {projection.message}
                    </Alert>
                  </div>
                )}

                {complete && (
                  <div className="mt-3">
                    <Alert tone="info" icon="🎉">
                      Goal reached! Pick a new target or start a fresh emergency buffer.
                    </Alert>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="mw-btn-primary flex-1"
                    onClick={() => {
                      setContributing(goal)
                      setAmount('')
                    }}
                  >
                    + Add money
                  </button>
                  <button
                    type="button"
                    className="mw-btn-secondary text-rose-600"
                    onClick={() => {
                      actions.removeGoal(goal.id)
                      notify('Goal removed')
                    }}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            )
          })
        )}

        <Card title="Popular goal types" subtitle="Tap to start one">
          <div className="flex flex-wrap gap-2">
            {GOAL_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="mw-chip"
                onClick={() => {
                  setForm({
                    name: preset.name,
                    emoji: preset.emoji,
                    target: '',
                    saved: '',
                    monthly: '',
                    emergency: Boolean(preset.emergency),
                  })
                  setModal('new')
                }}
              >
                {preset.emoji} {preset.name}
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={modal === 'new'} title="New savings goal" onClose={() => setModal(null)}>
        <form onSubmit={saveGoal} className="space-y-3">
          <Field label="Goal name">
            <input
              className="mw-input"
              placeholder="e.g. Emergency fund"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>

          <div>
            <span className="mw-label">Icon</span>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setForm({ ...form, emoji: preset.emoji })}
                  className={`grid h-9 w-9 place-items-center rounded-xl border text-lg transition ${
                    form.emoji === preset.emoji
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  {preset.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Target">
              <input
                className="mw-input"
                inputMode="decimal"
                placeholder="R 0"
                value={form.target}
                onChange={(event) => setForm({ ...form, target: event.target.value })}
              />
            </Field>
            <Field label="Saved already">
              <input
                className="mw-input"
                inputMode="decimal"
                placeholder="R 0"
                value={form.saved}
                onChange={(event) => setForm({ ...form, saved: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Monthly contribution" hint="How much you will move towards this goal each month">
            <input
              className="mw-input"
              inputMode="decimal"
              placeholder="R 0"
              value={form.monthly}
              onChange={(event) => setForm({ ...form, monthly: event.target.value })}
            />
          </Field>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.emergency}
              onChange={(event) => setForm({ ...form, emergency: event.target.checked })}
              className="h-4 w-4 accent-[#187e62]"
            />
            This is my emergency fund
          </label>

          <button type="submit" className="mw-btn-primary w-full">
            Create goal
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(contributing)}
        title={contributing ? `Add to ${contributing.name}` : ''}
        onClose={() => setContributing(null)}
      >
        <form onSubmit={submitContribution} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((quick) => (
              <button key={quick} type="button" className="mw-chip" onClick={() => setAmount(String(quick))}>
                +{formatR(quick)}
              </button>
            ))}
          </div>
          <Field label="Amount">
            <input
              className="mw-input"
              inputMode="decimal"
              autoFocus
              placeholder="R 0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>
          <button type="submit" className="mw-btn-primary w-full">
            Add to goal
          </button>
        </form>
      </Modal>
    </>
  )
}
