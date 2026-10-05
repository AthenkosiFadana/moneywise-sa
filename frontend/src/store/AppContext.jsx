import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_STATE, STORAGE_KEY } from '../data/defaults'
import { api, checkApi } from '../services/api'
import { AppContext } from './context'
import { askAssistant } from '../utils/assistant'
import { calculateConfidence } from '../utils/confidence'
import { analyseCashflow, breakdownByCategory, summariseBudget } from '../utils/calculations'

function loadStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return null
  }
}

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export function AppProvider({ children }) {
  const [state, setState] = useState(() => loadStored() || DEFAULT_STATE)
  const [apiStatus, setApiStatus] = useState('checking')
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => {
    let cancelled = false
    checkApi().then((ok) => {
      if (!cancelled) setApiStatus(ok ? 'online' : 'offline')
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or blocked — the session still works in memory */
    }
  }, [state])

  const notify = useCallback((message, tone = 'success') => {
    setToast({ message, tone })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2600)
  }, [])

  const update = useCallback((patch) => {
    setState((current) => ({
      ...current,
      ...(typeof patch === 'function' ? patch(current) : patch),
    }))
  }, [])

  const actions = useMemo(
    () => ({
      setProfile: (partial) => update({ profile: partial }),
      setProfileField: (field, value) =>
        update((current) => ({ profile: { ...current.profile, [field]: value } })),

      addExpense: (expense) =>
        update((current) => ({ expenses: [...current.expenses, { id: uid(), ...expense }] })),
      updateExpense: (id, partial) =>
        update((current) => ({
          expenses: current.expenses.map((item) => (item.id === id ? { ...item, ...partial } : item)),
        })),
      removeExpense: (id) =>
        update((current) => ({ expenses: current.expenses.filter((item) => item.id !== id) })),

      addBudgetCategory: (category) =>
        update((current) => ({ budget: [...current.budget, { id: uid(), ...category }] })),
      updateBudgetCategory: (id, partial) =>
        update((current) => ({
          budget: current.budget.map((item) => (item.id === id ? { ...item, ...partial } : item)),
        })),
      removeBudgetCategory: (id) =>
        update((current) => ({ budget: current.budget.filter((item) => item.id !== id) })),

      addGoal: (goal) =>
        update((current) => ({ goals: [...current.goals, { id: uid(), monthly: 0, ...goal }] })),
      updateGoal: (id, partial) =>
        update((current) => ({
          goals: current.goals.map((item) => (item.id === id ? { ...item, ...partial } : item)),
        })),
      removeGoal: (id) => update((current) => ({ goals: current.goals.filter((g) => g.id !== id) })),
      contributeToGoal: (id, amount) =>
        update((current) => ({
          goals: current.goals.map((item) =>
            item.id === id ? { ...item, saved: Math.max(0, (Number(item.saved) || 0) + Number(amount)) } : item,
          ),
        })),

      completeLesson: (slug) =>
        update((current) => ({
          learning: {
            ...current.learning,
            completed: current.learning.completed.includes(slug)
              ? current.learning.completed
              : [...current.learning.completed, slug],
          },
        })),
      recordQuizScore: (score) =>
        update((current) => ({
          learning: {
            ...current.learning,
            quizBest: Math.max(Number(current.learning.quizBest) || 0, Math.round(score)),
          },
        })),

      activateChallenge: (id) =>
        update((current) => ({
          challenges: current.challenges.active.includes(id)
            ? current.challenges
            : { ...current.challenges, active: [...current.challenges.active, id] },
        })),
      completeChallenge: (id) =>
        update((current) => ({
          challenges: {
            ...current.challenges,
            active: current.challenges.active.filter((item) => item !== id),
            completed: current.challenges.completed.includes(id)
              ? current.challenges.completed
              : [...current.challenges.completed, id],
          },
        })),

      pushMessage: (message) =>
        update((current) => ({
          assistant: [...current.assistant, { id: uid(), ...message, at: Date.now() }],
        })),
      clearChat: () => update({ assistant: [] }),

      resetDemo: () => {
        setState(DEFAULT_STATE)
        notify('Sample data restored')
      },
      clearAll: () => {
        setState({
          ...DEFAULT_STATE,
          profile: { ...DEFAULT_STATE.profile, income: 0 },
          expenses: [],
          budget: [],
          goals: [],
          learning: { completed: [], total: DEFAULT_STATE.learning.total, quizBest: null },
          challenges: { active: [], completed: [], streak: 0 },
          assistant: [],
        })
        notify('All data cleared')
      },
    }),
    [notify, update],
  )

  const derived = useMemo(() => {
    const income = Number(state.profile?.income) || 0
    const cashflow = analyseCashflow(income, state.expenses)
    const budgetSummary = summariseBudget(state.budget)
    const breakdown = breakdownByCategory(income, state.expenses)
    const confidence = calculateConfidence({
      ...state,
      learning: { ...state.learning, total: DEFAULT_STATE.learning.total },
    })

    return { income, cashflow, budgetSummary, breakdown, confidence }
  }, [state])

  const sendAssistantMessage = useCallback(
    async (question) => {
      actions.pushMessage({ role: 'user', text: question })

      let reply
      if (apiStatus === 'online') {
        try {
          const data = await api.assistant(question, state)
          reply = { reply: data.reply, metrics: data.metrics, suggestions: data.suggestions }
        } catch {
          reply = askAssistant(question, state)
        }
      } else {
        reply = askAssistant(question, state)
      }

      actions.pushMessage({ role: 'assistant', ...reply })
      return reply
    },
    [actions, apiStatus, state],
  )

  const refreshConfidence = useCallback(async () => {
    if (apiStatus !== 'online') return { source: 'local', data: derived.confidence }
    try {
      const data = await api.confidence(state)
      return { source: 'api', data }
    } catch {
      return { source: 'local', data: derived.confidence }
    }
  }, [apiStatus, derived.confidence, state])

  const value = useMemo(
    () => ({
      state,
      ...derived,
      ...actions,
      apiStatus,
      toast,
      notify,
      sendAssistantMessage,
      refreshConfidence,
    }),
    [state, derived, actions, apiStatus, toast, notify, sendAssistantMessage, refreshConfidence],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
