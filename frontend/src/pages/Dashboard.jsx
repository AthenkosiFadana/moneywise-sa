import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { SA_EXPENSE_CATEGORIES } from '../data/defaults'
import { formatPercent, formatR, parseAmount } from '../utils/money'
import { Alert, Badge, Card, EmptyState, Field, Modal, PageHeader, ProgressBar, StatCard } from '../components/ui'

const TONE_MAP = {
  positive: { stat: 'positive', badge: 'good', emoji: '🟢', bar: 'brand' },
  neutral: { stat: 'neutral', badge: 'slate', emoji: '🟡', bar: 'gold' },
  negative: { stat: 'negative', badge: 'risk', emoji: '🔴', bar: 'risk' },
}

export default function Dashboard() {
  const { state, income, cashflow, breakdown, confidence, actions, notify } = useApp()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ label: '', amount: '', category: 'Food' })

  const tone = TONE_MAP[cashflow.tone] || TONE_MAP.neutral
  const name = state.profile?.name || 'there'

  function submitExpense(event) {
    event.preventDefault()
    const amount = parseAmount(form.amount)
    if (!form.label.trim() || amount <= 0) {
      notify('Add a name and an amount greater than R0', 'error')
      return
    }
    actions.addExpense({ label: form.label.trim(), amount, category: form.category })
    setForm({ label: '', amount: '', category: 'Food' })
    setOpen(false)
    notify('Expense added')
  }

  return (
    <>
      <PageHeader
        eyebrow={state.profile?.month}
        title={`Hello, ${name} 👋`}
        description="Here is where your money stands right now."
        action={
          <button type="button" onClick={() => setOpen(true)} className="mw-btn-primary shrink-0">
            + Expense
          </button>
        }
      />

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">This month</p>
            <Badge tone={tone.badge}>
              {tone.emoji} {cashflow.status === 'surplus' ? 'Surplus' : cashflow.status === 'deficit' ? 'Overspending' : 'Break-even'}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Income</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{formatR(income)}</p>
            </div>
            <div className="border-x border-slate-100">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Expenses</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{formatR(cashflow.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Left</p>
              <p
                className={`mt-1 text-lg font-extrabold ${
                  cashflow.remaining >= 0 ? 'text-brand-600' : 'text-rose-600'
                }`}
              >
                {formatR(cashflow.remaining)}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Alert tone={cashflow.tone === 'positive' ? 'info' : cashflow.tone === 'negative' ? 'danger' : 'warning'} icon={tone.emoji}>
              {cashflow.message}
              {cashflow.status === 'surplus' && (
                <> That is {formatPercent(cashflow.savingsRate)} of your income available to save or invest.</>
              )}
              {cashflow.status === 'deficit' && <> Cut your three largest categories to get back under income.</>}
            </Alert>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/app/budget" className="mw-btn-secondary">
              Open budget
            </Link>
            <Link to="/app/calculators" className="mw-btn-secondary">
              Run a calculator
            </Link>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Savings rate"
            value={formatPercent(cashflow.savingsRate, 0)}
            hint="Aim for 10% or more"
            icon="📈"
            tone={cashflow.savingsRate >= 10 ? 'positive' : cashflow.savingsRate > 0 ? 'warning' : 'negative'}
          />
          <StatCard
            label="Confidence"
            value={`${confidence.overall}/100`}
            hint={confidence.level.name}
            icon="🧠"
            tone={confidence.level.tone === 'excellent' || confidence.level.tone === 'good' ? 'gold' : 'neutral'}
          />
        </div>

        <Card
          title="Where your money goes"
          subtitle="Share of your spending by category"
          action={
            <Link to="/app/budget" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              Manage →
            </Link>
          }
        >
          {breakdown.length === 0 ? (
            <EmptyState
              emoji="🧾"
              title="No expenses recorded yet"
              message="Add your first expense and MoneyWise will show you exactly where your salary goes."
              action={
                <button type="button" onClick={() => setOpen(true)} className="mw-btn-primary">
                  Add an expense
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {breakdown.slice(0, 5).map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.category}</span>
                    <span className="text-slate-500">
                      {formatR(item.amount)} · {formatPercent(item.percent)}
                    </span>
                  </div>
                  <ProgressBar value={item.percent} tone={tone.bar} height="h-1.5" />
                </div>
              ))}
              <p className="pt-1 text-[11px] leading-relaxed text-slate-400">
                Percentages are of your total spending. {formatR(income - cashflow.totalExpenses)} of your{' '}
                {formatR(income)} income is not spent.
              </p>
            </div>
          )}
        </Card>

        <Card
          title="Recent expenses"
          subtitle={`${state.expenses.length} recorded this month`}
          action={
            <Link to="/app/budget" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              See all →
            </Link>
          }
        >
          <div className="divide-y divide-slate-100">
            {state.expenses.length === 0 && (
              <p className="py-3 text-center text-xs text-slate-400">Nothing recorded yet.</p>
            )}
            {[...state.expenses]
              .reverse()
              .slice(0, 5)
              .map((expense) => (
                <div key={expense.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-sm">
                    {SA_EXPENSE_CATEGORIES.find((c) => c.name === expense.category)?.icon || '🧾'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{expense.label}</p>
                    <p className="text-[11px] text-slate-400">{expense.category}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{formatR(expense.amount)}</span>
                  <button
                    type="button"
                    onClick={() => actions.removeExpense(expense.id)}
                    className="text-slate-300 transition hover:text-rose-500"
                    aria-label={`Delete ${expense.label}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        </Card>

        <Link to="/app/insights" className="block">
          <Card className="border-brand-100 bg-gradient-to-br from-brand-50 to-white transition hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-brand-500 bg-white">
                <span className="text-lg font-black text-brand-700">{confidence.overall}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-600">Money Confidence Score</p>
                <p className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">{confidence.summary}</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <Modal open={open} title="Add an expense" onClose={() => setOpen(false)}>
        <form onSubmit={submitExpense} className="space-y-3">
          <Field label="What did you spend on?">
            <input
              className="mw-input"
              placeholder="e.g. Taxi fare"
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <input
                className="mw-input"
                inputMode="decimal"
                placeholder="R 0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className="mw-input"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {SA_EXPENSE_CATEGORIES.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <button type="submit" className="mw-btn-primary w-full">
            Save expense
          </button>
        </form>
      </Modal>
    </>
  )
}
