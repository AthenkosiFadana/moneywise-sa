import { addMonths, formatMonthYear, formatR, monthsLabel, round2 } from './money'

export function totalOf(items, key = 'amount') {
  return round2(items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0))
}

export function analyseCashflow(income, expenses) {
  const totalExpenses = totalOf(expenses)
  const monthlyIncome = Number(income) || 0
  const remaining = round2(monthlyIncome - totalExpenses)
  const savingsRate = monthlyIncome > 0 ? (remaining / monthlyIncome) * 100 : 0
  const expenseRatio = monthlyIncome > 0 ? (totalExpenses / monthlyIncome) * 100 : 0

  let status = 'break-even'
  let tone = 'neutral'
  let message = 'Your income and spending are exactly balanced.'

  if (remaining > 0) {
    status = 'surplus'
    tone = 'positive'
    message = "You're currently spending less than you earn."
  } else if (remaining < 0) {
    status = 'deficit'
    tone = 'negative'
    message = "You're spending more than you earn this month."
  }

  return {
    monthlyIncome,
    totalExpenses,
    remaining,
    savingsRate: round2(savingsRate),
    expenseRatio: round2(expenseRatio),
    status,
    tone,
    message,
    isEmpty: monthlyIncome === 0 && totalExpenses === 0,
  }
}

export function breakdownByCategory(income, expenses) {
  const totalExpenses = totalOf(expenses) || 1
  const grouped = new Map()

  expenses.forEach((expense) => {
    const key = expense.category || 'Other'
    grouped.set(key, (grouped.get(key) || 0) + (Number(expense.amount) || 0))
  })

  return [...grouped.entries()]
    .map(([category, amount]) => ({
      category,
      amount: round2(amount),
      percent: round2((amount / totalExpenses) * 100),
      ofIncome: income > 0 ? round2((amount / income) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function summariseBudget(categories) {
  const rows = categories.map((category) => {
    const budget = Number(category.budget) || 0
    const spent = Number(category.spent) || 0
    const remaining = round2(budget - spent)
    const usedPercent = budget > 0 ? round2((spent / budget) * 100) : 0
    const overBy = remaining < 0 ? Math.abs(remaining) : 0

    let status = 'ok'
    if (budget <= 0) status = 'unbudgeted'
    else if (overBy > 0) status = 'over'
    else if (usedPercent >= 90) status = 'warning'

    return { ...category, budget, spent, remaining, usedPercent, overBy, status }
  })

  const totalBudget = round2(rows.reduce((sum, row) => sum + row.budget, 0))
  const totalSpent = round2(rows.reduce((sum, row) => sum + row.spent, 0))
  const totalRemaining = round2(totalBudget - totalSpent)
  const overBudget = rows.filter((row) => row.status === 'over')
  const warnings = rows.filter((row) => row.status === 'warning')

  const alerts = overBudget.map((row) => ({
    tone: 'negative',
    text: `${row.name} budget exceeded by ${formatR(row.overBy)}.`,
  }))

  warnings.forEach((row) => {
    alerts.push({
      tone: 'warning',
      text: `${row.name} is at ${row.usedPercent}% of its budget.`,
    })
  })

  const spendRate = totalBudget > 0 ? round2((totalSpent / totalBudget) * 100) : 0

  return {
    rows,
    totalBudget,
    totalSpent,
    totalRemaining,
    overBudget,
    warnings,
    alerts,
    spendRate,
    hasData: rows.length > 0,
  }
}

export function savingsProjection({ target, current, monthly }) {
  const goal = Number(target) || 0
  const saved = Number(current) || 0
  const contribution = Number(monthly) || 0
  const shortfall = round2(Math.max(0, goal - saved))
  const progress = goal > 0 ? round2(Math.min(100, (saved / goal) * 100)) : 0

  if (goal <= 0) {
    return { valid: false, message: 'Enter a savings goal greater than R0.' }
  }
  if (saved >= goal) {
    return {
      valid: true,
      reached: true,
      goal,
      saved,
      contribution,
      shortfall: 0,
      progress: 100,
      months: 0,
      monthsLabel: 'Goal reached',
      projectedDate: 'Done',
      weekly: 0,
      daily: 0,
      message: 'Congratulations — you have already reached this goal!',
    }
  }
  if (contribution <= 0) {
    return {
      valid: false,
      goal,
      saved,
      shortfall,
      progress,
      message: 'Add a monthly contribution to see how long your goal will take.',
    }
  }

  const months = Math.ceil(shortfall / contribution)
  const date = addMonths(new Date(), months)

  return {
    valid: true,
    reached: false,
    goal,
    saved,
    contribution,
    shortfall,
    progress,
    months,
    monthsLabel: monthsLabel(months),
    projectedDate: formatMonthYear(date),
    weekly: round2((contribution * 12) / 52),
    daily: round2((contribution * 12) / 365),
    message: `At ${formatR(contribution)} per month you will reach your goal in about ${monthsLabel(months)}.`,
  }
}

export function emergencyFundTarget({ essentials, months = 3 }) {
  const monthlyEssentials = Number(essentials) || 0
  const target = round2(monthlyEssentials * months)
  return {
    monthlyEssentials,
    months,
    target,
    monthlyNeeded12: target > 0 ? round2(target / 12) : 0,
    weeklyNeeded52: target > 0 ? round2(target / 52) : 0,
    valid: monthlyEssentials > 0,
  }
}

export function debtRepayment({ principal, monthly, annualRate = 0 }) {
  const balance = Number(principal) || 0
  const payment = Number(monthly) || 0
  const rate = (Number(annualRate) || 0) / 100 / 12

  if (balance <= 0) return { valid: false, message: 'Enter the amount you owe.' }
  if (payment <= 0) return { valid: false, message: 'Enter your monthly repayment.' }

  const minInterest = rate > 0 ? balance * rate : 0
  if (payment <= minInterest && rate > 0) {
    return {
      valid: false,
      message: `Your payment must be higher than the interest charged each month (${formatR(minInterest)}).`,
    }
  }

  let remaining = balance
  let months = 0
  let totalPaid = 0
  let totalInterest = 0
  const schedule = []

  while (remaining > 0.005 && months < 1200) {
    const interest = remaining * rate
    let principalPaid = payment - interest
    if (principalPaid > remaining) {
      principalPaid = remaining
      totalPaid += principalPaid + interest
      totalInterest += interest
      remaining = 0
    } else {
      remaining -= principalPaid
      totalPaid += payment
      totalInterest += interest
    }
    months += 1
    if (schedule.length < 12) {
      schedule.push({
        month: months,
        opening: round2(remaining + principalPaid),
        payment: round2(Math.min(payment, principalPaid + interest)),
        interest: round2(interest),
        principal: round2(principalPaid),
        closing: round2(Math.max(0, remaining)),
      })
    }
  }

  const payoff = addMonths(new Date(), months)
  const overpayment = round2(totalPaid - balance)

  return {
    valid: true,
    balance,
    payment,
    annualRate: Number(annualRate) || 0,
    months,
    monthsLabel: monthsLabel(months),
    projectedDate: formatMonthYear(payoff),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalInterest),
    overpayment,
    schedule,
    message: `You will clear this debt in about ${monthsLabel(months)}, paying ${formatR(totalInterest)} in interest.`,
  }
}

const NEEDS_BUDGET = 0.5
const WANTS_BUDGET = 0.3
const SAVINGS_BUDGET = 0.2

export function affordabilityCheck({ income, commitments = [], newCommitment = 0 }) {
  const monthlyIncome = Number(income) || 0
  const existing = round2(commitments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0))
  const extra = Number(newCommitment) || 0
  const total = round2(existing + extra)
  const afterCommitments = round2(monthlyIncome - total)
  const ratio = monthlyIncome > 0 ? round2((total / monthlyIncome) * 100) : 0
  const extraRatio = monthlyIncome > 0 ? round2((extra / monthlyIncome) * 100) : 0
  const existingRatio = monthlyIncome > 0 ? round2((existing / monthlyIncome) * 100) : 0

  const bands = {
    needs: round2(monthlyIncome * NEEDS_BUDGET),
    wants: round2(monthlyIncome * WANTS_BUDGET),
    savings: round2(monthlyIncome * SAVINGS_BUDGET),
  }

  let verdict = 'caution'
  let headline = 'This commitment needs a closer look.'
  if (monthlyIncome <= 0) {
    verdict = 'unknown'
    headline = 'Enter your monthly income to see an affordability breakdown.'
  } else if (afterCommitments < 0) {
    verdict = 'tight'
    headline = 'These commitments cost more than you earn each month.'
  } else if (ratio <= 50) {
    verdict = 'comfortable'
    headline = 'Your commitments stay within a healthy share of your income.'
  } else if (ratio <= 70) {
    verdict = 'caution'
    headline = 'Your commitments take up a large share of your income.'
  } else {
    verdict = 'tight'
    headline = 'Your commitments use most of your income, leaving little room to save.'
  }

  return {
    monthlyIncome,
    existing,
    extra,
    total,
    afterCommitments,
    ratio,
    extraRatio,
    existingRatio,
    bands,
    verdict,
    headline,
    valid: monthlyIncome > 0,
  }
}

export function fiftyThirtyTwenty(income) {
  const monthly = Number(income) || 0
  return {
    income: monthly,
    needs: round2(monthly * NEEDS_BUDGET),
    wants: round2(monthly * WANTS_BUDGET),
    savings: round2(monthly * SAVINGS_BUDGET),
    valid: monthly > 0,
  }
}
