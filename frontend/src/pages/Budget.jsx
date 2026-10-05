import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/useApp'
import { SA_EXPENSE_CATEGORIES, SA_INCOME_SOURCES } from '../data/defaults'
import { formatPercent, formatR, parseAmount } from '../utils/money'
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  Field,
  ListRow,
  Modal,
  PageHeader,
  ProgressBar,
  SegmentedTabs,
} from '../components/ui'

const STATUS_META = {
  ok: { tone: 'good', label: 'On track', bar: 'brand' },
  warning: { tone: 'watch', label: 'Almost there', bar: 'gold' },
  over: { tone: 'risk', label: 'Over budget', bar: 'risk' },
  unbudgeted: { tone: 'slate', label: 'No limit', bar: 'slate' },
}

export default function Budget() {
  const { state, income, cashflow, budgetSummary, actions, notify } = useApp()
  const [tab, setTab] = useState('categories')
  const [modal, setModal] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '🧾', budget: '', spent: '' })
  const [expenseForm, setExpenseForm] = useState({ label: '', amount: '', category: 'Food' })

  function openCategory(category) {
    setCategoryForm(
      category
        ? { id: category.id, name: category.name, icon: category.icon || '🧾', budget: String(category.budget), spent: String(category.spent) }
        : { name: '', icon: '🧾', budget: '', spent: '' },
    )
    setModal('category')
  }

  function saveCategory(event) {
    event.preventDefault()
    const payload = {
      name: categoryForm.name.trim() || 'Other',
      icon: categoryForm.icon,
      budget: parseAmount(categoryForm.budget),
      spent: parseAmount(categoryForm.spent),
    }
    if (payload.budget <= 0) {
      notify('Set a budget greater than R0', 'error')
      return
    }
    if (categoryForm.id) {
      actions.updateBudgetCategory(categoryForm.id, payload)
      notify('Category updated')
    } else {
      actions.addBudgetCategory(payload)
      notify('Category added')
    }
    setModal(null)
  }

  function addExpense(event) {
    event.preventDefault()
    const amount = parseAmount(expenseForm.amount)
    if (!expenseForm.label.trim() || amount <= 0) {
      notify('Add a name and an amount greater than R0', 'error')
      return
    }
    actions.addExpense({ label: expenseForm.label.trim(), amount, category: expenseForm.category })
    setExpenseForm({ label: '', amount: '', category: 'Food' })
    notify('Expense added')
  }

  const { rows, totalBudget, totalSpent, totalRemaining, alerts, spendRate, hasData } = budgetSummary

  return (
    <>
      <PageHeader
        eyebrow="Plan the month"
        title="Budget planner"
        description="Set a limit for each category and track what you have spent so far."
      />

      <div className="space-y-4">
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'categories', label: 'Categories' },
            { id: 'flows', label: 'Income & expenses' },
          ]}
        />

        {tab === 'categories' ? (
          <>
            <Card>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total budget</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatR(totalBudget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Spent</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatR(totalSpent)}</p>
                </div>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={spendRate}
                  tone={spendRate > 100 ? 'risk' : spendRate >= 90 ? 'gold' : 'brand'}
                  height="h-2.5"
                  label={`${formatPercent(spendRate)} of budget used`}
                />
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-xs">
                <span className="text-slate-500">Remaining</span>
                <span
                  className={`font-extrabold ${totalRemaining >= 0 ? 'text-brand-700' : 'text-rose-600'}`}
                >
                  {formatR(totalRemaining)}
                </span>
              </div>
            </Card>

            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <Alert key={index} tone={alert.tone === 'negative' ? 'danger' : 'warning'} icon={alert.tone === 'negative' ? '⚠️' : '👀'}>
                    {alert.text}
                  </Alert>
                ))}
              </div>
            )}

            <Card
              title="Categories"
              subtitle="Tap a category to update what you planned and what you spent"
              action={
                <button type="button" onClick={() => openCategory(null)} className="text-xs font-bold text-brand-600">
                  + Add
                </button>
              }
            >
              {!hasData ? (
                <EmptyState
                  emoji="📊"
                  title="No budget categories yet"
                  message="Add categories like Housing, Food and Transport so the app can flag overspending for you."
                  action={
                    <button type="button" onClick={() => openCategory(null)} className="mw-btn-primary">
                      Add a category
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {rows.map((row) => {
                    const meta = STATUS_META[row.status]
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => openCategory(row)}
                        className="block w-full rounded-xl border border-slate-100 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/40"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{row.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-bold text-slate-800">{row.name}</p>
                              <Badge tone={meta.tone}>{meta.label}</Badge>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                              <span>
                                {formatR(row.spent)} of {formatR(row.budget)}
                              </span>
                              <span className={row.remaining < 0 ? 'font-bold text-rose-600' : 'font-semibold text-slate-600'}>
                                {row.remaining < 0 ? `-${formatR(row.overBy)} over` : `${formatR(row.remaining)} left`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <ProgressBar
                            value={row.usedPercent}
                            tone={meta.bar}
                            height="h-1.5"
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </Card>

            <Card title="Spending vs income" subtitle="How your budget compares with the month as a whole">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-brand-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">Income</p>
                  <p className="mt-1 text-lg font-extrabold text-brand-800">{formatR(income)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Planned spending</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-800">{formatR(cashflow.totalExpenses)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {formatR(cashflow.remaining)} is left after your recorded expenses — a savings rate of{' '}
                {formatPercent(cashflow.savingsRate)}.{' '}
                <Link to="/app/goals" className="font-bold text-brand-600">
                  Put it towards a goal →
                </Link>
              </p>
            </Card>
          </>
        ) : (
          <>
            <Card title="Monthly income" subtitle="Everything that comes in during a month">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Amount">
                  <input
                    className="mw-input"
                    inputMode="decimal"
                    value={state.profile.income || ''}
                    placeholder="R 0"
                    onChange={(event) =>
                      actions.setProfileField('income', parseAmount(event.target.value))
                    }
                  />
                </Field>
                <Field label="Source">
                  <select
                    className="mw-input"
                    value={state.profile.source}
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

            <Card title="Monthly expenses" subtitle={`${state.expenses.length} recorded · ${formatR(cashflow.totalExpenses)} total`}>
              <div className="divide-y divide-slate-100">
                {state.expenses.length === 0 && (
                  <p className="py-3 text-center text-xs text-slate-400">No expenses recorded yet.</p>
                )}
                {state.expenses.map((expense) => (
                  <ListRow
                    key={expense.id}
                    icon={SA_EXPENSE_CATEGORIES.find((c) => c.name === expense.category)?.icon || '🧾'}
                    title={expense.label}
                    subtitle={expense.category}
                    right={
                      <input
                        className="w-20 rounded-lg border border-transparent bg-transparent px-1.5 py-1 text-right text-xs font-bold text-slate-700 outline-none transition hover:border-slate-200 focus:border-brand-400 focus:bg-white"
                        inputMode="decimal"
                        value={expense.amount}
                        onChange={(event) =>
                          actions.updateExpense(expense.id, { amount: parseAmount(event.target.value) })
                        }
                        aria-label={`${expense.label} amount`}
                      />
                    }
                  />
                ))}
              </div>

              <form onSubmit={addExpense} className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <input
                  className="mw-input col-span-2 sm:col-span-1"
                  placeholder="e.g. Electricity"
                  value={expenseForm.label}
                  onChange={(event) => setExpenseForm({ ...expenseForm, label: event.target.value })}
                />
                <div className="col-span-2 flex gap-2 sm:col-span-1">
                  <input
                    className="mw-input"
                    inputMode="decimal"
                    placeholder="R 0"
                    value={expenseForm.amount}
                    onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })}
                  />
                  <button type="submit" className="mw-btn-primary shrink-0">
                    Add
                  </button>
                </div>
                <select
                  className="mw-input col-span-2"
                  value={expenseForm.category}
                  onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}
                >
                  {SA_EXPENSE_CATEGORIES.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </form>
            </Card>

            <Card title="What to remember" subtitle="Costs that catch people out in South Africa">
              <div className="flex flex-wrap gap-2">
                {SA_EXPENSE_CATEGORIES.map((category) => (
                  <span key={category.name} className="mw-chip" title={category.hint}>
                    {category.icon} {category.name}
                  </span>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>

      <Modal
        open={modal === 'category'}
        title={categoryForm.id ? 'Edit category' : 'Add category'}
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" onClick={saveCategory} className="mw-btn-primary flex-1">
              Save
            </button>
            {categoryForm.id && (
              <button
                type="button"
                className="mw-btn-secondary text-rose-600"
                onClick={() => {
                  actions.removeBudgetCategory(categoryForm.id)
                  setModal(null)
                  notify('Category removed')
                }}
              >
                Delete
              </button>
            )}
          </>
        }
      >
        <form onSubmit={saveCategory} className="space-y-3">
          <div className="grid grid-cols-[64px_1fr] gap-3">
            <Field label="Icon">
              <input
                className="mw-input text-center"
                maxLength={2}
                value={categoryForm.icon}
                onChange={(event) => setCategoryForm({ ...categoryForm, icon: event.target.value })}
              />
            </Field>
            <Field label="Category name">
              <input
                className="mw-input"
                placeholder="e.g. Transport"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Budget for the month">
              <input
                className="mw-input"
                inputMode="decimal"
                placeholder="R 0"
                value={categoryForm.budget}
                onChange={(event) => setCategoryForm({ ...categoryForm, budget: event.target.value })}
              />
            </Field>
            <Field label="Spent so far">
              <input
                className="mw-input"
                inputMode="decimal"
                placeholder="R 0"
                value={categoryForm.spent}
                onChange={(event) => setCategoryForm({ ...categoryForm, spent: event.target.value })}
              />
            </Field>
          </div>
          <button type="submit" className="hidden" />
        </form>
      </Modal>
    </>
  )
}
