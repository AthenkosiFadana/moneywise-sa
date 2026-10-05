export const CHALLENGES = [
  {
    id: 'no-spend-7',
    title: '7-Day No-Spend Challenge',
    emoji: '🔥',
    duration: '7 days',
    description:
      'Avoid all non-essential spending for seven days. Essentials like rent, transport and food still count — takeaways, airtime top-ups and shopping do not.',
    how: 'Mark one day complete each day you stay on plan.',
    reward: '7-Day Budget Streak',
    rewardEmoji: '📅',
    metric: 'streak',
  },
  {
    id: 'r100-saving',
    title: 'R100 Saving Challenge',
    emoji: '💵',
    duration: '1 week',
    description:
      'Save R100 this week. Small, real and finishable — the point is proving to yourself that you can keep money.',
    how: 'Move R100 into a separate account and mark it complete.',
    reward: 'First R100 Saved',
    rewardEmoji: '🐷',
    metric: 'savings',
  },
  {
    id: 'emergency-1000',
    title: 'Emergency Fund Starter',
    emoji: '🚨',
    duration: 'Ongoing',
    description: 'Save your first R1,000 as a mini emergency buffer before anything else.',
    how: 'Create an emergency goal and contribute towards it every pay day.',
    reward: 'Emergency Fund Starter',
    rewardEmoji: '🛡️',
    metric: 'emergency',
  },
  {
    id: 'subscription-audit',
    title: 'Subscription Audit',
    emoji: '🧾',
    duration: '30 minutes',
    description:
      'List every recurring payment you make — streaming, apps, data bundles, memberships — and cancel at least one you do not really use.',
    how: 'Check your bank statement for monthly debits and cut one.',
    reward: 'MoneyWise Beginner',
    rewardEmoji: '🎓',
    metric: 'audit',
  },
]

export const BADGES = [
  { id: 'first-100', name: 'First R100 Saved', emoji: '💵', hint: 'Set aside your first R100.' },
  { id: 'streak-7', name: '7-Day Budget Streak', emoji: '📅', hint: 'Stay on plan for seven days.' },
  { id: 'goal-done', name: 'First Goal Completed', emoji: '🏆', hint: 'Reach a savings goal in full.' },
  { id: 'emergency-starter', name: 'Emergency Fund Starter', emoji: '🛡️', hint: 'Start building a buffer.' },
  { id: 'beginner', name: 'MoneyWise Beginner', emoji: '🎓', hint: 'Complete your first lesson.' },
]

export const CHALLENGE_COMPLETED = 'challenge-completed'
export const LESSON_COMPLETED = 'lesson-completed'
export const GOAL_REACHED = 'goal-reached'
export const FIRST_SAVED = 'first-saved'
export const QUIZ_PASSED = 'quiz-passed'
