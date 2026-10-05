export const SA_INCOME_SOURCES = [
  'Salary',
  'Part-time work',
  'Gig / freelance work',
  'NSFAS or student allowance',
  'Social grant',
  'Informal business',
  'Family support',
  'Other',
]

export const SA_EXPENSE_CATEGORIES = [
  { name: 'Housing', icon: '🏠', hint: 'Rent, bond, municipal account' },
  { name: 'Transport', icon: '🚕', hint: 'Taxi, fuel, bus, train' },
  { name: 'Food', icon: '🛒', hint: 'Groceries and meals' },
  { name: 'Data & airtime', icon: '📱', hint: 'Bundles and calls' },
  { name: 'Electricity', icon: '⚡', hint: 'Prepaid and municipal' },
  { name: 'Family support', icon: '👨‍👩‍👧', hint: 'Money sent home' },
  { name: 'Entertainment', icon: '🎉', hint: 'Outings and streaming' },
  { name: 'Debt repayments', icon: '💳', hint: 'Loans, store cards, furniture' },
  { name: 'School fees', icon: '🎓', hint: 'Fees, uniforms, supplies' },
  { name: 'Health', icon: '🏥', hint: 'Medical, meds, funeral cover' },
  { name: 'Stokvel', icon: '🤝', hint: 'Contributions and savings clubs' },
  { name: 'Savings & goals', icon: '💰', hint: 'Money you keep' },
  { name: 'Other', icon: '🧾', hint: 'Everything else' },
]

export const GOAL_PRESETS = [
  { name: 'Emergency fund', emoji: '🚨', emergency: true },
  { name: 'New phone', emoji: '📱' },
  { name: 'Education', emoji: '🎓' },
  { name: 'Car', emoji: '🚗' },
  { name: 'Home deposit', emoji: '🏠' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Business startup', emoji: '💼' },
  { name: 'Funeral cover', emoji: '⚰️' },
]

export const DEFAULT_STATE = {
  profile: {
    name: 'Thando',
    income: 8000,
    source: 'Salary',
    month: 'Current month',
  },
  expenses: [
    { id: 'exp-1', label: 'Rent', category: 'Housing', amount: 2500 },
    { id: 'exp-2', label: 'Taxi fare', category: 'Transport', amount: 1200 },
    { id: 'exp-3', label: 'Groceries', category: 'Food', amount: 1500 },
    { id: 'exp-4', label: 'Data', category: 'Data & airtime', amount: 400 },
    { id: 'exp-5', label: 'Family support', category: 'Family support', amount: 500 },
    { id: 'exp-6', label: 'Outings', category: 'Entertainment', amount: 400 },
  ],
  budget: [
    { id: 'cat-1', name: 'Housing', icon: '🏠', budget: 2500, spent: 2300 },
    { id: 'cat-2', name: 'Food', icon: '🛒', budget: 1500, spent: 1200 },
    { id: 'cat-3', name: 'Transport', icon: '🚕', budget: 1200, spent: 1100 },
    { id: 'cat-4', name: 'Data & airtime', icon: '📱', budget: 400, spent: 380 },
    { id: 'cat-5', name: 'Family support', icon: '👨‍👩‍👧', budget: 500, spent: 500 },
    { id: 'cat-6', name: 'Entertainment', icon: '🎉', budget: 400, spent: 450 },
  ],
  goals: [
    {
      id: 'goal-1',
      name: 'Car',
      emoji: '🚗',
      target: 60000,
      saved: 18500,
      monthly: 2000,
      deadline: '',
    },
    {
      id: 'goal-2',
      name: 'Emergency fund',
      emoji: '🚨',
      target: 15000,
      saved: 4500,
      monthly: 600,
      emergency: true,
      coverMonths: 3,
      deadline: '',
    },
    {
      id: 'goal-3',
      name: 'New phone',
      emoji: '📱',
      target: 12000,
      saved: 3200,
      monthly: 500,
      deadline: '',
    },
  ],
  debts: [],
  learning: {
    completed: ['budgeting-101'],
    total: 7,
    quizBest: null,
  },
  challenges: {
    active: [],
    completed: [],
    streak: 3,
  },
  assistant: [],
}

export const STORAGE_KEY = 'moneywise-sa:v1'
