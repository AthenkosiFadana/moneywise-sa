import { useEffect } from 'react'

export function Card({ title, subtitle, action, children, className = '', bodyClass = '' }) {
  return (
    <section className={`mw-card ${className}`}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-bold text-slate-800">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  )
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{eyebrow}</p>
          )}
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-1 max-w-xl text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

const STAT_TONES = {
  positive: 'text-brand-700 bg-brand-50 border-brand-100',
  negative: 'text-rose-700 bg-rose-50 border-rose-100',
  warning: 'text-amber-700 bg-amber-50 border-amber-100',
  neutral: 'text-slate-700 bg-slate-50 border-slate-200',
  gold: 'text-gold-800 bg-gold-100 border-gold-200',
}

export function StatCard({ label, value, hint, tone = 'neutral', icon }) {
  return (
    <div className={`rounded-2xl border p-4 ${STAT_TONES[tone] || STAT_TONES.neutral}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
        {icon && <span aria-hidden>{icon}</span>}
      </div>
      <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
      {hint && <p className="mt-0.5 text-xs font-medium text-slate-500">{hint}</p>}
    </div>
  )
}

export function ProgressBar({ value, tone = 'brand', height = 'h-2', label }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0))
  const fills = {
    brand: 'bg-brand-500',
    gold: 'bg-gold-500',
    warning: 'bg-amber-500',
    risk: 'bg-rose-500',
    slate: 'bg-slate-400',
  }

  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-semibold text-slate-700">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${height}`}>
        <div
          className={`${height} rounded-full ${fills[tone] || fills.brand} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}

const BADGE_TONES = {
  good: 'bg-brand-50 text-brand-700 border-brand-100',
  watch: 'bg-amber-50 text-amber-700 border-amber-100',
  risk: 'bg-rose-50 text-rose-700 border-rose-100',
  gold: 'bg-gold-100 text-gold-800 border-gold-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function Badge({ tone = 'slate', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
        BADGE_TONES[tone] || BADGE_TONES.slate
      } ${className}`}
    >
      {children}
    </span>
  )
}

export function Alert({ tone = 'info', children, icon }) {
  const tones = {
    info: 'border-brand-100 bg-brand-50 text-brand-800',
    warning: 'border-amber-100 bg-amber-50 text-amber-800',
    danger: 'border-rose-100 bg-rose-50 text-rose-800',
    gold: 'border-gold-200 bg-gold-100 text-gold-900',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium leading-relaxed ${
        tones[tone] || tones.info
      }`}
    >
      {icon && <span aria-hidden className="mt-px text-sm">{icon}</span>}
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mw-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  )
}

export function EmptyState({ emoji = '🌱', title, message, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-8 text-center">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-2 text-sm font-bold text-slate-800">{title}</h3>
      {message && <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{message}</p>}
      {action && <div className="mt-3 flex justify-center gap-2">{action}</div>}
    </div>
  )
}

export function SegmentedTabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition ${
            value === tab.id
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined
    const handler = (event) => event.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
      />
      <div className="relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">{children}</div>
        {footer && <div className="mt-5 flex flex-wrap gap-2">{footer}</div>}
      </div>
    </div>
  )
}

export function ListRow({ icon, title, subtitle, right, onClick, className = '' }) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition ${
        onClick ? 'hover:bg-slate-50' : ''
      } ${className}`}
    >
      {icon && <span className="text-lg">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        {subtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 text-right text-xs font-semibold text-slate-600">{right}</div>}
    </Tag>
  )
}
