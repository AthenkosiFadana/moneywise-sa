import { useMemo, useState } from 'react'
import { useApp } from '../store/useApp'
import { debtRepayment, emergencyFundTarget, fiftyThirtyTwenty, savingsProjection } from '../utils/calculations'
import { formatR, monthsLabel, parseAmount } from '../utils/money'
import { Alert, Card, Field, PageHeader, ProgressBar, SegmentedTabs } from '../components/ui'

function ResultPanel({ items, message, tone = 'brand' }) {
  const tones = {
    brand: 'bg-brand-50 border-brand-100',
    gold: 'bg-gold-100/60 border-gold-200',
    risk: 'bg-rose-50 border-rose-100',
  }

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.brand}`}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-0.5 text-lg font-extrabold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
      {message && <p className="mt-3 text-xs font-medium leading-relaxed text-slate-600">{message}</p>}
    </div>
  )
}

function SavingsCalculator() {
  const [form, setForm] = useState({ target: '10000', current: '2000', monthly: '800' })
  const result = useMemo(
    () =>
      savingsProjection({
        target: parseAmount(form.target),
        current: parseAmount(form.current),
        monthly: parseAmount(form.monthly),
      }),
    [form],
  )

  return (
    <div className="space-y-4">
      <Card title="Savings calculator" subtitle="How long until you reach your goal?">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Goal amount">
            <input
              className="mw-input"
              inputMode="decimal"
              value={form.target}
              onChange={(event) => setForm({ ...form, target: event.target.value })}
            />
          </Field>
          <Field label="Saved already">
            <input
              className="mw-input"
              inputMode="decimal"
              value={form.current}
              onChange={(event) => setForm({ ...form, current: event.target.value })}
            />
          </Field>
          <Field label="Monthly contribution">
            <input
              className="mw-input"
              inputMode="decimal"
              value={form.monthly}
              onChange={(event) => setForm({ ...form, monthly: event.target.value })}
            />
          </Field>
        </div>
      </Card>

      {result.valid ? (
        <ResultPanel
          tone={result.reached ? 'brand' : 'gold'}
          items={[
            { label: 'Still needed', value: formatR(result.shortfall) },
            { label: 'Time to goal', value: result.reached ? 'Reached 🎉' : monthsLabel(result.months) },
            { label: 'Finish by', value: result.projectedDate },
            { label: 'Progress', value: `${Math.round(result.progress)}%` },
          ]}
          message={`${result.message} That is about ${formatR(result.weekly)} a week or ${formatR(result.daily)} a day.`}
        />
      ) : (
        <Alert tone="warning" icon="💡">
          {result.message}
        </Alert>
      )}
    </div>
  )
}

function EmergencyCalculator() {
  const { cashflow } = useApp()
  const [essentials, setEssentials] = useState(() => String(Math.round(cashflow.totalExpenses || 5000)))
  const [months, setMonths] = useState(3)
  const result = useMemo(
    () => emergencyFundTarget({ essentials: parseAmount(essentials), months }),
    [essentials, months],
  )

  return (
    <div className="space-y-4">
      <Card title="Emergency fund calculator" subtitle="How much buffer do you actually need?">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Monthly essential expenses" hint="Rent, food, transport, data, electricity">
            <input
              className="mw-input"
              inputMode="decimal"
              value={essentials}
              onChange={(event) => setEssentials(event.target.value)}
            />
          </Field>
          <Field label="Months of cover">
            <select className="mw-input" value={months} onChange={(event) => setMonths(Number(event.target.value))}>
              <option value={1}>1 month — minimal buffer</option>
              <option value={3}>3 months — standard target</option>
              <option value={6}>6 months — well protected</option>
            </select>
          </Field>
        </div>
        <button
          type="button"
          className="mt-3 text-xs font-bold text-brand-600"
          onClick={() => setEssentials(String(Math.round(cashflow.totalExpenses || 0)))}
        >
          Use my recorded expenses ({formatR(cashflow.totalExpenses)})
        </button>
      </Card>

      {result.valid ? (
        <ResultPanel
          items={[
            { label: 'Recommended fund', value: formatR(result.target) },
            { label: 'Per month (12 months)', value: formatR(result.monthlyNeeded12) },
            { label: 'Per week (52 weeks)', value: formatR(result.weeklyNeeded52) },
            { label: 'Mini starter', value: formatR(1000) },
          ]}
          message={`${months} months of essentials gives you ${formatR(
            result.target,
          )}. Start with R1,000 so a small surprise never becomes debt, then build from there. Keep it in a separate account you cannot tap easily.`}
        />
      ) : (
        <Alert tone="warning" icon="💡">
          Enter your monthly essential expenses to see a target.
        </Alert>
      )}
    </div>
  )
}

function DebtCalculator() {
  const [form, setForm] = useState({ principal: '10000', monthly: '1000', rate: '15' })
  const result = useMemo(
    () =>
      debtRepayment({
        principal: parseAmount(form.principal),
        monthly: parseAmount(form.monthly),
        annualRate: parseAmount(form.rate),
      }),
    [form],
  )

  return (
    <div className="space-y-4">
      <Card title="Debt repayment calculator" subtitle="See how fast a balance clears and what it costs">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Amount owed">
            <input
              className="mw-input"
              inputMode="decimal"
              value={form.principal}
              onChange={(event) => setForm({ ...form, principal: event.target.value })}
            />
          </Field>
          <Field label="Monthly payment">
            <input
              className="mw-input"
              inputMode="decimal"
              value={form.monthly}
              onChange={(event) => setForm({ ...form, monthly: event.target.value })}
            />
          </Field>
          <Field label="Interest rate (% p.a.)">
            <input
              className="mw-input"
              inputMode="decimal"
              value={form.rate}
              onChange={(event) => setForm({ ...form, rate: event.target.value })}
            />
          </Field>
        </div>
      </Card>

      {!result.valid ? (
        <Alert tone="warning" icon="💡">
          {result.message}
        </Alert>
      ) : (
        <>
          <ResultPanel
            tone={result.totalInterest > result.balance * 0.5 ? 'risk' : 'gold'}
            items={[
              { label: 'Time to clear', value: monthsLabel(result.months) },
              { label: 'Debt-free date', value: result.projectedDate },
              { label: 'Total interest', value: formatR(result.totalInterest) },
              { label: 'Total paid', value: formatR(result.totalPaid) },
            ]}
            message={result.message}
          />

          <Card title="First 12 payments" subtitle="How each instalment is split">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Payment</th>
                    <th className="py-2 pr-2">Interest</th>
                    <th className="py-2 pr-2">Principal</th>
                    <th className="py-2">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.schedule.map((row) => (
                    <tr key={row.month} className="text-slate-600">
                      <td className="py-2 pr-2 font-semibold">{row.month}</td>
                      <td className="py-2 pr-2">{formatR(row.payment)}</td>
                      <td className="py-2 pr-2 text-rose-500">{formatR(row.interest)}</td>
                      <td className="py-2 pr-2 text-brand-600">{formatR(row.principal)}</td>
                      <td className="py-2 font-semibold text-slate-800">{formatR(row.closing)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">
              Interest is charged on the outstanding balance each month, so early payments do the most work.
            </p>
          </Card>
        </>
      )}
    </div>
  )
}

function SplitCalculator() {
  const { income } = useApp()
  const [amount, setAmount] = useState(() => String(income || 8000))
  const split = useMemo(() => fiftyThirtyTwenty(parseAmount(amount)), [amount])

  return (
    <div className="space-y-4">
      <Card title="50/30/20 split" subtitle="A simple way to divide your income">
        <Field label="Monthly income">
          <input
            className="mw-input"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
      </Card>

      {split.valid ? (
        <div className="space-y-3">
          <div className="mw-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-800">🏠 Needs</span>
              <span className="font-extrabold text-brand-700">{formatR(split.needs)}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={50} tone="brand" height="h-2" />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Rent, transport, food, data, electricity, school fees</p>
          </div>
          <div className="mw-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-800">🎉 Wants</span>
              <span className="font-extrabold text-gold-700">{formatR(split.wants)}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={30} tone="gold" height="h-2" />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Takeaways, outings, streaming, airtime extras</p>
          </div>
          <div className="mw-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-800">💰 Savings & debt</span>
              <span className="font-extrabold text-slate-800">{formatR(split.savings)}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={20} tone="slate" height="h-2" />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">Emergency fund, goals, extra debt repayments, investing</p>
          </div>
          <Alert tone="slate" icon="ℹ️">
            If your rent alone is more than 50% of your income, treat this as a compass rather than a rule and protect
            the essentials first.
          </Alert>
        </div>
      ) : (
        <Alert tone="warning" icon="💡">
          Enter your monthly income to see the split.
        </Alert>
      )}
    </div>
  )
}

export default function Calculators() {
  const [tab, setTab] = useState('savings')

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Financial calculators"
        description="Work the numbers before you commit."
      />

      <div className="space-y-4">
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'savings', label: 'Savings' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'debt', label: 'Debt' },
            { id: 'split', label: '50/30/20' },
          ]}
        />

        {tab === 'savings' && <SavingsCalculator />}
        {tab === 'emergency' && <EmergencyCalculator />}
        {tab === 'debt' && <DebtCalculator />}
        {tab === 'split' && <SplitCalculator />}

        <Alert tone="gold" icon="🤖">
          The same calculations are exposed by the MoneyWise REST API, so results stay consistent across the app.
        </Alert>
      </div>
    </>
  )
}
