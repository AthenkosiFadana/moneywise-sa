import { clamp } from './money'
import { analyseCashflow, summariseBudget, totalOf } from './calculations'

const DEBT_CATEGORIES = ['debt', 'credit', 'loans', 'repayments', 'furniture', 'payday loan']

export const PILLAR_META = {
  budgeting: {
    label: 'Budgeting',
    icon: '📊',
    hint: 'How clearly you plan and track your spending.',
  },
  saving: {
    label: 'Saving',
    icon: '💰',
    hint: 'Whether you keep something back every month.',
  },
  debt: {
    label: 'Debt management',
    icon: '💳',
    hint: 'How comfortably you handle what you owe.',
  },
  emergency: {
    label: 'Emergency fund',
    icon: '🚨',
    hint: 'Your buffer for unexpected expenses.',
  },
  knowledge: {
    label: 'Financial knowledge',
    icon: '🎓',
    hint: 'What you have learned so far in the Learning Hub.',
  },
}

export const PILLAR_TIPS = {
  budgeting:
    'Give every rand a job before the month starts — start with housing, transport and food, then the rest.',
  saving:
    'Automate a small transfer on pay day. Even R100 a month builds the habit before the amount matters.',
  debt:
    'List every debt with its interest rate and clear the most expensive one first while paying minimums on the rest.',
  emergency:
    'Aim for three months of essential expenses. Start with a R1,000 mini emergency fund so you stop using credit for surprises.',
  knowledge:
    'Complete one lesson and the short knowledge check in the Learning Hub this week.',
}

function toneFor(score) {
  if (score >= 75) return 'good'
  if (score >= 50) return 'watch'
  return 'risk'
}

function pillarResult(key, score, detail) {
  const safeScore = clamp(Math.round(score), 0, 100)
  return {
    key,
    label: PILLAR_META[key].label,
    icon: PILLAR_META[key].icon,
    hint: PILLAR_META[key].hint,
    score: safeScore,
    tone: toneFor(safeScore),
    detail,
    tip: PILLAR_TIPS[key],
  }
}

function scoreBudgeting({ income, expenses, budget }) {
  let score = 0
  const details = []

  if (income > 0) {
    score += 20
  } else {
    details.push('Add your monthly income')
  }

  if (expenses.length >= 3) {
    score += 15
  } else if (expenses.length > 0) {
    score += 7
    details.push('Log more of your regular expenses')
  } else {
    details.push('Start tracking your expenses')
  }

  const summary = summariseBudget(budget)
  const tracked = summary.rows.filter((row) => row.budget > 0 && row.spent > 0)

  if (tracked.length >= 4) score += 20
  else if (tracked.length >= 1) score += 10
  else details.push('Set budgets and record what you spent')

  if (tracked.length > 0) {
    const withinBudget = tracked.filter((row) => row.status !== 'over').length
    score += 25 * (withinBudget / tracked.length)
    if (withinBudget < tracked.length) details.push('Bring overspent categories back on track')
  }

  const cashflow = analyseCashflow(income, expenses)
  if (income > 0 && expenses.length > 0) {
    if (cashflow.remaining > 0) score += 12
    if (cashflow.savingsRate >= 10) score += 8
    else if (cashflow.remaining > 0) score += 4
    else details.push('Spend less than you earn this month')
  }

  return pillarResult(
    'budgeting',
    score,
    details[0] || 'You plan and track your spending consistently.',
  )
}

function scoreSaving({ income, expenses, goals }) {
  let score = 0
  const details = []
  const cashflow = analyseCashflow(income, expenses)

  if (income > 0 && expenses.length > 0) {
    const rate = cashflow.savingsRate
    if (rate >= 20) score += 50
    else if (rate >= 10) score += 38
    else if (rate >= 5) score += 26
    else if (rate > 0) score += 15
    else score += 0
    if (rate < 10) details.push('Aim to keep at least 10% of your income')
  } else {
    score += 10
    details.push('Record income and expenses to measure your savings rate')
  }

  const savingsGoals = goals.filter((goal) => !goal.premium)
  const withContributions = savingsGoals.filter((goal) => Number(goal.monthly) > 0)

  if (withContributions.length >= 2) score += 25
  else if (withContributions.length === 1) score += 15
  else if (savingsGoals.length > 0) score += 6
  else details.push('Create your first savings goal')

  if (savingsGoals.length > 0) {
    const progresses = savingsGoals.map((goal) =>
      clamp((Number(goal.saved) / Math.max(1, Number(goal.target))) * 100, 0, 100),
    )
    const avg = progresses.reduce((a, b) => a + b, 0) / progresses.length
    score += (avg / 100) * 25
    if (avg < 25) details.push('Keep contributing to reach your first milestone')
  }

  return pillarResult('saving', score, details[0] || 'You are building savings habits each month.')
}

function scoreDebt({ income, expenses, budget, debts }) {
  const declared = Array.isArray(debts) ? debts.filter((d) => Number(d.balance) > 0) : []
  const incomeDebt = totalOf(
    expenses.filter((expense) =>
      DEBT_CATEGORIES.includes(String(expense.category || '').toLowerCase()),
    ),
  )
  const budgetDebt = budget
    .filter((row) => DEBT_CATEGORIES.includes(String(row.name || '').toLowerCase()))
    .reduce((sum, row) => sum + (Number(row.spent) || 0), 0)
  const monthlyDebt = Math.max(incomeDebt, budgetDebt)
  const totalDebt = declared.reduce((sum, d) => sum + (Number(d.balance) || 0), 0)

  if (monthlyDebt <= 0 && totalDebt <= 0) {
    return {
      ...pillarResult('debt', 55, 'No debt recorded — nothing is working against you.'),
      neutral: true,
    }
  }

  let score = 0
  const details = []

  if (income > 0) {
    const ratio = (monthlyDebt / income) * 100
    if (ratio <= 10) score += 45
    else if (ratio <= 15) score += 35
    else if (ratio <= 25) score += 20
    else score += 5
    if (ratio > 15) details.push('Debt repayments should stay under 15% of income')
  } else {
    score += 15
    details.push('Add your income to measure your debt load')
  }

  if (declared.length > 0) {
    score += 25
    const unaffordable = declared.filter((d) => Number(d.balance) > 0 && Number(d.payment) <= 0)
    if (unaffordable.length > 0) details.push('Record a repayment amount for each debt')
  } else {
    score += 10
    details.push('Add your debts for a fuller picture')
  }

  const cashflow = analyseCashflow(income, expenses)
  if (cashflow.remaining > 0) score += 20
  else if (income > 0) details.push('You are spending more than you earn')

  if (totalDebt > 0 && cashflow.remaining > 0) score += 10

  return pillarResult('debt', score, details[0] || 'Your debt repayments look manageable.')
}

function scoreEmergency({ income, goals, savingsRate }) {
  const emergencyGoal = goals.find(
    (goal) => goal.emergency || String(goal.name || '').toLowerCase().includes('emergency'),
  )

  if (!emergencyGoal) {
    const partial = income > 0 && savingsRate > 0 ? 35 : 20
    return {
      ...pillarResult('emergency', partial, 'You do not have an emergency fund goal yet.'),
      missing: true,
    }
  }

  const target = Math.max(1, Number(emergencyGoal.target))
  const progress = clamp((Number(emergencyGoal.saved) / target) * 100, 0, 100)
  const fundedMonths = Number(emergencyGoal.coverMonths) || 0

  let score = progress * 0.8
  if (fundedMonths >= 3) score += 20
  else if (fundedMonths > 0) score += fundedMonths * 5
  else if (Number(emergencyGoal.monthly) > 0) score += 10

  const detail =
    progress >= 100
      ? 'Your emergency fund target is fully funded.'
      : progress > 0
        ? `Your emergency fund is ${Math.round(progress)}% funded.`
        : 'Your emergency fund goal exists but has no savings yet.'

  return pillarResult('emergency', score, detail)
}

function scoreKnowledge({ lessonsTotal, lessonsCompleted, quizBest }) {
  let score = 0
  const details = []
  const completed = Array.isArray(lessonsCompleted) ? lessonsCompleted.length : 0
  const total = lessonsTotal || 1

  score += clamp(completed / total, 0, 1) * 60
  if (completed === 0) details.push('Complete your first lesson in the Learning Hub')

  if (quizBest === null || quizBest === undefined) {
    details.push('Take the money knowledge check to unlock this score')
  } else {
    score += (clamp(quizBest, 0, 100) / 100) * 40
    if (quizBest < 70) details.push('Review the lessons behind the questions you missed')
  }

  return pillarResult('knowledge', score, details[0] || 'You are building real financial knowledge.')
}

const WEIGHTS = {
  budgeting: 0.25,
  saving: 0.25,
  debt: 0.2,
  emergency: 0.15,
  knowledge: 0.15,
}

function levelFor(overall) {
  if (overall >= 80) return { name: 'MoneyWise', tone: 'excellent' }
  if (overall >= 60) return { name: 'Confident', tone: 'good' }
  if (overall >= 40) return { name: 'Building', tone: 'watch' }
  return { name: 'Starter', tone: 'risk' }
}

export function calculateConfidence(state) {
  const income = Number(state.profile?.income) || 0
  const expenses = state.expenses || []
  const budget = state.budget || []
  const goals = state.goals || []
  const debts = state.debts || []
  const cashflow = analyseCashflow(income, expenses)

  const pillars = [
    scoreBudgeting({ income, expenses, budget }),
    scoreSaving({ income, expenses, goals }),
    scoreDebt({ income, expenses, budget, debts }),
    scoreEmergency({ income, goals, savingsRate: cashflow.savingsRate }),
    scoreKnowledge({
      lessonsTotal: state.learning?.total || 1,
      lessonsCompleted: state.learning?.completed || [],
      quizBest: state.learning?.quizBest ?? null,
    }),
  ]

  const overall = Math.round(
    pillars.reduce((sum, pillar) => sum + pillar.score * WEIGHTS[pillar.key], 0),
  )

  const ranked = [...pillars].sort((a, b) => b.score - a.score)
  const strongest = ranked[0]
  const weakest = ranked[ranked.length - 1]
  const level = levelFor(overall)

  return {
    overall,
    level,
    pillars,
    strongest,
    weakest,
    summary:
      `Your strongest area is ${strongest.label.toLowerCase()}. ` +
      `Your next opportunity is ${weakest.label.toLowerCase()} — ${weakest.tip}`,
    updated: new Date().toISOString(),
  }
}
