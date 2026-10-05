import { affordabilityCheck, analyseCashflow, breakdownByCategory, fiftyThirtyTwenty } from './calculations'
import { formatPercent, formatR } from './money'

const DISCLAIMER =
  'This is general financial education, not personalised financial advice. Check the fine print and speak to a qualified adviser before making big money decisions.'

function extractAmounts(text) {
  const matches = text.match(/(?:r)\s?(\d[\d\s,]*(?:\.\d+)?)/gi) || []
  return matches
    .map((match) => Number.parseFloat(match.replace(/[^\d.]/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b - a)
}

function extractPair(text, keyword) {
  const pattern = new RegExp(`(?:${keyword})[^\\d]{0,30}?r?\\s?([\\d][\\d\\s,]*)`, 'i')
  const match = text.match(pattern)
  if (!match || match[1] === undefined) return null
  const value = Number.parseFloat(match[1].replace(/[^\d.]/g, ''))
  return Number.isFinite(value) ? value : null
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word))
}

const SUGGESTIONS = {
  afford: [
    { label: 'Plan a budget', to: '/app/budget' },
    { label: 'Check affordability', to: '/app/calculators' },
  ],
  save: [
    { label: 'Set a savings goal', to: '/app/goals' },
    { label: 'Savings calculator', to: '/app/calculators' },
  ],
  debt: [{ label: 'Debt calculator', to: '/app/calculators' }],
  learn: [{ label: 'Open the Learning Hub', to: '/app/learn' }],
}

function line(...parts) {
  return parts.filter(Boolean).join('\n')
}

function answerAfford(text, state) {
  const amounts = extractAmounts(text)
  const declaredIncome =
    extractPair(text, 'i earn') ??
    extractPair(text, 'my (?:salary|income)') ??
    extractPair(text, 'earn') ??
    (hasAny(text, ['salary', 'income', 'i earn']) ? amounts[0] : null)

  const income = declaredIncome || Number(state.profile?.income) || 0
  const rent = extractPair(text, 'rent') || extractPair(text, 'accommodation')
  const commitment =
    amounts.find((value) => value !== income && value !== rent) ??
    extractPair(text, 'contract|repayment|phone|car|loan') ??
    0

  if (!income) {
    return {
      reply: line(
        'I need your monthly income to work this out.',
        '',
        'Try: "I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?"',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.afford,
    }
  }

  const commitments = []
  if (rent) commitments.push({ label: 'Rent', amount: rent })

  const result = affordabilityCheck({ income, commitments, newCommitment: commitment })
  const bands = result.bands
  const rentShare = rent ? formatPercent((rent / income) * 100) : null

  const metrics = [
    { label: 'Income', value: formatR(income) },
    { label: 'Commitments', value: formatR(result.total) },
    { label: 'Left to budget', value: formatR(result.afterCommitments) },
  ]

  const parts = [result.headline, '']

  if (rent) {
    parts.push(
      `Your rent of ${formatR(rent)} already uses ${rentShare} of your income. The rough guide for housing costs is under 30%, so you are ${
        (rent / income) * 100 <= 30 ? 'within that guide' : 'above that guide'
      }.`,
    )
  } else if (result.existing > 0) {
    parts.push(
      `Your existing commitments use ${formatPercent(result.existingRatio)} of your income (${formatR(result.existing)}).`,
    )
  }

  if (commitment > 0) {
    parts.push(
      `Adding ${formatR(commitment)} would take your commitments to ${formatR(result.total)} — ${formatPercent(
        result.ratio,
      )} of your income — and leave ${formatR(result.afterCommitments)} for everything else.`,
    )
    parts.push('')
    parts.push(
      `As a guide, a month at ${formatR(income)} splits roughly into needs ${formatR(bands.needs)}, wants ${formatR(
        bands.wants,
      )} and savings ${formatR(bands.savings)}.`,
    )
  }

  parts.push('')
  parts.push(
    result.verdict === 'comfortable'
      ? 'It looks workable, but check your full budget first so the small costs do not surprise you.'
      : result.verdict === 'caution'
        ? 'Compare cheaper options, and ask whether you can delay the commitment for a month while you rebuild your buffer.'
        : 'At this level the commitment would squeeze your essentials. Consider a cheaper option or a smaller deposit plan first.',
  )
  parts.push('')
  parts.push(DISCLAIMER)

  return { reply: parts.join('\n'), metrics, suggestions: SUGGESTIONS.afford }
}

function answerSaving(text, state) {
  const income = Number(state.profile?.income) || extractAmounts(text)[0] || 0

  if (!income) {
    return {
      reply: line(
        'A good starting rule is to save first, spend what is left.',
        '',
        '• Beginners: at least R100 a month, on pay day.',
        '• Steady earners: aim for 10% of income.',
        '• Comfortable earners: try the 50/30/20 split — 50% needs, 30% wants, 20% savings.',
        '',
        'Tell me your monthly income and I will split it for you.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.save,
    }
  }

  const split = fiftyThirtyTwenty(income)
  const cashflow = analyseCashflow(income, state.expenses || [])
  const currentRate = cashflow.savingsRate

  const parts = [
    `Here is a 50/30/20 split for ${formatR(income)} a month:`,
    '',
    `• Needs (rent, food, transport, data): ${formatR(split.needs)}`,
    `• Wants (airtime extras, outings, subscriptions): ${formatR(split.wants)}`,
    `• Savings and investing: ${formatR(split.savings)}`,
    '',
  ]

  if (state.expenses?.length) {
    parts.push(
      `Right now your recorded spending is ${formatR(cashflow.totalExpenses)}, which leaves ${formatR(
        cashflow.remaining,
      )} — a savings rate of ${formatPercent(currentRate)}.`,
      '',
      currentRate >= 10
        ? 'That is a solid habit. Consider moving your surplus to a goal automatically on pay day.'
        : 'To reach 20%, look at your three biggest expense lines first — those are where the wins are.',
      '',
    )
  }

  parts.push(
    'A practical order: 1) a R1,000 mini buffer, 2) three months of essential expenses, 3) then longer-term investing.',
    '',
    DISCLAIMER,
  )

  return { reply: parts.join('\n'), suggestions: SUGGESTIONS.save }
}

function answerEmergency(text, state) {
  const expenseLine = (state.expenses || []).find((expense) =>
    ['rent', 'food', 'transport', 'essentials'].includes(String(expense.category || '').toLowerCase()),
  )
  const essentials =
    extractAmounts(text)[0] ||
    (state.expenses || []).reduce((sum, expense) => {
      const essential = ['housing', 'food', 'transport', 'utilities', 'family'].includes(
        String(expense.category || '').toLowerCase(),
      )
      return sum + (essential ? Number(expense.amount) || 0 : 0)
    }, 0)

  const parts = [
    'An emergency fund is money you only touch when something unexpected happens — a medical bill, a phone repair, losing work for two weeks.',
    '',
    'The standard target is three to six months of essential expenses. In practice, start smaller:',
    '',
    '1. First R1,000 as a mini buffer so a small surprise does not become debt.',
    '2. Then build to one month of essentials.',
    '3. Then work towards three months.',
  ]

  if (essentials > 0) {
    parts.push('', `At ${formatR(essentials)} of essential expenses, a three-month fund is ${formatR(essentials * 3)}.`)
    parts.push(`That is about ${formatR((essentials * 3) / 12)} a month over a year, or ${formatR((essentials * 3) / 52)} a week.`)
  } else if (expenseLine) {
    parts.push('', 'Add up your essentials in the dashboard and I will size the target for you.')
  }

  parts.push('', 'Keep it in a separate account you cannot tap easily — a separate savings account or a fixed deposit.', '', DISCLAIMER)

  return { reply: parts.join('\n'), suggestions: SUGGESTIONS.save }
}

function answerDifference(text) {
  if (hasAny(text, ['invest', 'investing', 'shares', 'etf'])) {
    return {
      reply: line(
        'Saving vs investing, simply:',
        '',
        'Saving keeps money safe and accessible — a savings account or fixed deposit. Low risk, low return, good for money you need soon.',
        '',
        'Investing buys assets that can grow over time — shares, exchange traded funds, bonds, property. Higher potential return, but the value can fall in the short term, so it suits money you will not need for five years or more.',
        '',
        'A common order in South Africa: emergency fund first, then long-term investing through a tax-free savings account (up to R36,000 a year and R500,000 in your lifetime) or a retirement annuity.',
        '',
        'Do not invest money you may need next month.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.learn,
    }
  }

  return {
    reply: line(
      'Saving means setting money aside for a specific goal or an emergency, usually in a low-risk account where the balance stays steady.',
      '',
      'Investing means putting money to work in assets that can grow in value over time, accepting that the value can also fall in the short term.',
      '',
      'Simple rule: money you need in the next year → save it. Money you will not touch for five or more years → consider investing it.',
      '',
      DISCLAIMER,
    ),
    suggestions: SUGGESTIONS.learn,
  }
}

function answerVanishingMoney(text, state) {
  const cashflow = analyseCashflow(Number(state.profile?.income) || 0, state.expenses || [])
  const breakdown = breakdownByCategory(Number(state.profile?.income) || 0, state.expenses || [])

  if (!breakdown.length) {
    return {
      reply: line(
        'Money rarely disappears in one big purchase — it leaks through lots of small ones.',
        '',
        'The fastest fix is to write down every expense for seven days, then group them: housing, transport, food, data, family, fun. Almost everyone finds two or three surprise lines.',
        '',
        'Log a week of spending in the Budget tab and I will show you where your money is actually going.',
        '',
        DISCLAIMER,
      ),
      suggestions: [{ label: 'Log my spending', to: '/app/budget' }],
    }
  }

  const top = breakdown.slice(0, 3)
  const parts = [
    `Based on your entries, you earn ${formatR(cashflow.monthlyIncome)} and spend ${formatR(
      cashflow.totalExpenses,
    )}, leaving ${formatR(cashflow.remaining)}.`,
    '',
    'Your three biggest lines are:',
    ...top.map(
      (item, index) => `${index + 1}. ${item.category}: ${formatR(item.amount)} (${formatPercent(item.percent)} of your spending)`,
    ),
    '',
    cashflow.remaining < 0
      ? 'You are spending more than you earn — pick the biggest non-essential line and cut it by 20% this month.'
      : 'You are spending less than you earn. The next step is to move the leftover to a goal before the month ends.',
    '',
    DISCLAIMER,
  ]

  return { reply: parts.join('\n'), suggestions: [{ label: 'Open my budget', to: '/app/budget' }] }
}

function answerDebt(text) {
  if (hasAny(text, ['credit score', 'credit record'])) {
    return {
      reply: line(
        'A credit score is a number (typically 300 to 850 in South Africa) that summarises how you have handled credit.',
        '',
        'What moves it up: paying on time, keeping balances low, having a healthy mix of credit, and not applying for lots of credit at once.',
        '',
        'What moves it down: late or missed payments, judgments, defaults, and using more than about 30% of your credit limits.',
        '',
        'You can check your score for free through the major bureaux — check at least once a year for errors and fraud.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.debt,
    }
  }

  if (hasAny(text, ['interest', 'apr', 'rate'])) {
    return {
      reply: line(
        'Interest is the price you pay for borrowing money, shown as a percentage per year (an annual rate).',
        '',
        'Example: R10,000 at 15% a year costs about R1,250 in interest in the first year if you make no repayments. Interest compounds — you pay interest on interest — so expensive debt grows fast.',
        '',
        'Two useful moves: pay more than the minimum on the debt with the highest rate, and always compare the total cost, not just the monthly instalment.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.debt,
    }
  }

  return {
    reply: line(
      'A workable debt method, in order:',
      '',
      '1. List every debt: balance, interest rate and minimum payment.',
      '2. Pay the minimums on all of them.',
      '3. Throw every extra rand at the highest interest rate first — that saves the most money.',
      '4. Stop new debt while you repay, and avoid only paying interest with rollover balances.',
      '',
      'Use the debt repayment calculator to see how fast a given monthly payment clears a balance.',
      '',
      DISCLAIMER,
    ),
    suggestions: SUGGESTIONS.debt,
  }
}

function answerBudget() {
  return {
    reply: line(
      'A budget is simply a plan for your money before the month starts.',
      '',
      'The 50/30/20 version is a good starting point:',
      '• 50% needs — rent, transport, food, data, electricity, school fees',
      '• 30% wants — takeaways, airtime extras, streaming, outings',
      '• 20% savings, debt extra repayments and goals',
      '',
      'Steps: 1) write your income, 2) list fixed costs first, 3) set a limit for each category, 4) track spending weekly, 5) adjust at month end.',
      '',
      'In South Africa also remember the costs that catch people out: municipal accounts, funeral contributions, stokvel contributions and family support.',
      '',
      DISCLAIMER,
    ),
    suggestions: [{ label: 'Build my budget', to: '/app/budget' }],
  }
}

function answerScam() {
  return {
    reply: line(
      'Common financial scams in South Africa to watch for:',
      '',
      '• "SARS refund" or "prize" messages with a link — official bodies do not ask for passwords or one-time pins by SMS.',
      '• Advance-fee loans that demand an "activation" or "insurance" payment first.',
      '• Someone offering to buy items from your card or to "share" a wallet or account with you.',
      '• Investment schemes promising fixed high returns with no risk — that is the classic warning sign.',
      '• Romance or social media contacts who quickly move the conversation to money or crypto.',
      '',
      'Golden rules: never share your one-time pin or password, verify requests on an official number, and if the return looks too good to be true, walk away.',
      '',
      'Report fraud to your bank immediately and log a case with the SAPS.',
      '',
      DISCLAIMER,
    ),
    suggestions: SUGGESTIONS.learn,
  }
}

function answerSouthAfrica(text) {
  if (hasAny(text, ['stokvel'])) {
    return {
      reply: line(
        'A stokvel is a savings or investment club where members contribute fixed amounts regularly and take turns receiving the payout, or save together for a goal.',
        '',
        'Good stokvels: clear written rules, named office bearers, a bank account in the club name, and transparent records.',
        '',
        'Warning signs: cash only, no receipts, pressure to recruit new members, guaranteed returns, or payments that only work if you bring in others.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.learn,
    }
  }

  if (hasAny(text, ['nsfas', 'allowance', 'student'])) {
    return {
      reply: line(
        'If your money comes from NSFAS or a student allowance, budget it over the whole period it must last — not the week it arrives.',
        '',
        'Split it the same way as a salary: accommodation and food first, then transport and study materials, then a small buffer for emergencies. Avoid using part of it for someone else\'s urgent need and then borrowing for your own.',
        '',
        DISCLAIMER,
      ),
      suggestions: [{ label: 'Set a budget', to: '/app/budget' }],
    }
  }

  if (hasAny(text, ['grant', 'sassa'])) {
    return {
      reply: line(
        'When a grant is your household income, prioritise food, electricity, transport and school costs before anything discretionary.',
        '',
        'Keep the grant money separate from any other money in the house if you can — separate accounts make it far easier to see what is left.',
        '',
        'SASSA will never ask you to pay money to receive a grant, and will never ask for your PIN or password.',
        '',
        DISCLAIMER,
      ),
      suggestions: [{ label: 'Track my spending', to: '/app/budget' }],
    }
  }

  if (hasAny(text, ['tax', 'sars', 'uif', 'paye'])) {
    return {
      reply: line(
        'In South Africa, employees are taxed through PAYE deducted by the employer, and you can check your income tax on the SARS eFiling or SARS MobiApp.',
        '',
        'If you freelance or do gig work, you may need to register as a taxpayer and charge VAT once you pass the R1 million threshold in a 12-month period. Keep every invoice and expense record from day one.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.learn,
    }
  }

  return {
    reply: line(
      'MoneyWise SA is built around South African realities — taxi fares, data bundles, electricity, school fees, family support, funeral cover and stokvels.',
      '',
      'Ask me about any of those, or about budgeting, saving, debt or avoiding scams.',
      '',
      DISCLAIMER,
    ),
    suggestions: SUGGESTIONS.learn,
  }
}

function answerGoal(text, state) {
  const goals = state.goals || []
  if (!goals.length) {
    return {
      reply: line(
        'A savings goal needs four things: a target amount, a date, the amount you have today, and a monthly contribution.',
        '',
        'Start with something reachable in three to six months — a phone, a course, or your first R1,000 emergency buffer. Small wins build the habit.',
        '',
        'I can calculate how many months a goal will take in the Savings calculator.',
        '',
        DISCLAIMER,
      ),
      suggestions: SUGGESTIONS.save,
    }
  }

  const nearest = [...goals].sort(
    (a, b) => a.target - a.saved - (b.target - b.saved),
  )[0]
  const percent = Math.round((nearest.saved / Math.max(1, nearest.target)) * 100)

  return {
    reply: line(
      `Your goal "${nearest.name}" is ${formatR(nearest.saved)} of ${formatR(nearest.target)} (${percent}%).`,
      '',
      nearest.monthly > 0
        ? `At ${formatR(nearest.monthly)} a month you are on track — keep the contribution automatic so it happens before you can spend it.`
        : 'Set a monthly contribution so the goal has a real date attached.',
      '',
      DISCLAIMER,
    ),
    suggestions: SUGGESTIONS.save,
  }
}

function answerGreeting() {
  return {
    reply: line(
      'Hi — I am the MoneyWise assistant. I explain money concepts and help you think through a decision using your own numbers.',
      '',
      'Try one of these:',
      '• "I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?"',
      '• "How much should I save?"',
      '• "How do I start an emergency fund?"',
      '• "What is the difference between saving and investing?"',
      '• "Why does my money disappear so quickly?"',
      '',
      DISCLAIMER,
    ),
    suggestions: SUGGESTIONS.learn,
  }
}

function fallback() {
  const topics = [
    { label: 'Can I afford something?', to: '/app/calculators' },
    { label: 'How much should I save?', to: '/app/goals' },
    { label: 'Understanding debt', to: '/app/learn' },
    { label: 'Avoiding scams', to: '/app/learn' },
  ]

  return {
    reply: line(
      'I am not sure I have a clear answer for that one yet.',
      '',
      'I can help with budgeting, saving, emergency funds, debt and interest, credit scores, affordability checks, saving vs investing, scams, and South African money topics like stokvels, grants and NSFAS allowances.',
      '',
      `Try: "Can I afford a ${formatR(1500)} phone contract on ${formatR(7500)}?"`,
      '',
      DISCLAIMER,
    ),
    suggestions: topics,
  }
}

const INTENTS = [
  { id: 'afford', words: ['afford', 'can i buy', 'can i get', 'can i take', 'phone contract', 'should i buy'], run: answerAfford },
  { id: 'vanishing', words: ['disappear', 'where does my money', 'money go', 'overspend', 'too much'], run: answerVanishingMoney },
  { id: 'emergency', words: ['emergency fund', 'emergency money', 'rainy day', 'buffer'], run: answerEmergency },
  { id: 'difference', words: ['difference between', 'saving vs', 'vs investing', 'invest vs'], run: answerDifference },
  { id: 'invest', words: ['invest', 'shares', 'etf', 'stock', 'unit trust', 'crypto'], run: answerDifference },
  { id: 'debt', words: ['debt', 'interest', 'credit', 'loan', 'repayment', 'instalment'], run: answerDebt },
  { id: 'scam', words: ['scam', 'fraud', 'phishing', 'one-time pin', 'otp', 'suspicious message'], run: answerScam },
  { id: 'south-africa', words: ['stokvel', 'nsfas', 'grant', 'sassa', 'sars', 'tax', 'funeral', 'taxi', 'data bundle'], run: answerSouthAfrica },
  { id: 'goal', words: ['goal', 'save for', 'target', 'car fund', 'deposit'], run: answerGoal },
  { id: 'save', words: ['how much should i save', 'how much to save', 'start saving', 'saving habit', '50/30/20', 'budget rule'], run: answerSaving },
  { id: 'budget', words: ['budget', 'how do i budget', 'plan my money', '50 30 20'], run: answerBudget },
  { id: 'greeting', words: ['hi', 'hello', 'hey', 'good day', 'help'], run: answerGreeting },
]

export function askAssistant(question, state = {}) {
  const text = String(question || '').toLowerCase().trim()
  if (!text) return answerGreeting()

  const intent = INTENTS.find((entry) => hasAny(text, entry.words))
  const result = intent
    ? intent.run(text, state)
    : /r\s?\d|earn|salary|income/.test(text)
      ? answerAfford(text, state)
      : fallback(text)

  return { ...result, intent: intent?.id || 'fallback' }
}

export const STARTER_PROMPTS = [
  'I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?',
  'How much should I save?',
  'How do I start an emergency fund?',
  'What is the difference between saving and investing?',
  'Why does my money disappear so quickly?',
  'How do I know if a WhatsApp loan offer is a scam?',
]
