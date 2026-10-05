import { NavLink, Link, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../data/nav'
import { useApp } from '../store/useApp'

function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-sm font-black text-gold-300">
        R
      </span>
      {!compact && (
        <span className="text-sm font-extrabold tracking-tight text-slate-900">
          MoneyWise <span className="text-brand-600">SA</span>
        </span>
      )}
    </Link>
  )
}

function StatusDot() {
  const { apiStatus } = useApp()
  const config = {
    online: { color: 'bg-brand-500', label: 'API connected' },
    offline: { color: 'bg-gold-500', label: 'Offline mode — saving on this device' },
    checking: { color: 'bg-slate-300', label: 'Checking API' },
  }[apiStatus]

  return (
    <span title={config.label} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      <span className="hidden sm:inline">{apiStatus === 'online' ? 'Live' : 'Local'}</span>
    </span>
  )
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-5 md:flex">
      <Logo />
      <nav className="mt-8 flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <span aria-hidden>{item.icon}</span>
            {item.label === 'Calc' ? 'Calculators' : item.label}
          </NavLink>
        ))}
        <NavLink
          to="/app/assistant"
          className={({ isActive }) =>
            `mt-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              isActive
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-dashed border-slate-300 text-slate-500 hover:border-brand-300 hover:text-brand-700'
            }`
          }
        >
          <span aria-hidden>🤖</span>
          MoneyWise Assistant
        </NavLink>
      </nav>
      <div className="rounded-2xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">
        Financial education and budgeting support — not regulated personalised financial advice.
      </div>
    </aside>
  )
}

function TopBar() {
  const { state, income } = useApp()
  const name = state.profile?.name || 'Friend'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="md:hidden">
          <Logo />
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-bold text-slate-800">
            {name} <span className="font-medium text-slate-400">· {state.profile?.source}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot />
          <Link
            to="/app/profile"
            className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-black text-brand-700"
            title={`Monthly income ${income > 0 ? 'recorded' : 'not set'}`}
          >
            {name.slice(0, 1).toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  )
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[9.5px] font-semibold transition ${
                isActive ? 'text-brand-700' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-6 w-9 place-items-center rounded-full text-sm transition ${
                    isActive ? 'bg-brand-50' : ''
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function AssistantFab() {
  const location = useLocation()
  if (location.pathname === '/app/assistant') return null

  return (
    <Link
      to="/app/assistant"
      className="fixed bottom-20 right-4 z-40 flex h-13 items-center gap-2 rounded-full bg-brand-700 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-700/30 transition hover:bg-brand-800 active:scale-95 md:bottom-6"
      aria-label="Open the MoneyWise assistant"
    >
      <span aria-hidden>🤖</span>
      <span className="hidden sm:inline">Ask MoneyWise</span>
    </Link>
  )
}

function Toast() {
  const { toast } = useApp()
  if (!toast) return null

  const tones = {
    success: 'bg-brand-700 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-slate-900 text-white',
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4 md:bottom-8">
      <div className={`rounded-full px-4 py-2 text-xs font-semibold shadow-lg ${tones[toast.tone] || tones.success}`}>
        {toast.message}
      </div>
    </div>
  )
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="md:pl-60">
        <TopBar />
        <main className="mx-auto max-w-3xl px-4 pb-40 pt-5">{children}</main>
      </div>
      <BottomNav />
      <AssistantFab />
      <Toast />
    </div>
  )
}
