export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

export function formatR(value, { decimals = 0, sign = false } = {}) {
  const num = Number(value)
  if (!Number.isFinite(num)) return 'R0'
  const abs = Math.abs(num)
  const formatted = abs.toLocaleString('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  const prefix = num < 0 ? '-R' : sign && num > 0 ? '+R' : 'R'
  return `${prefix}${formatted}`
}

export function formatRounded(value) {
  return formatR(Math.round(Number(value) || 0))
}

export function formatPercent(value, decimals = 0) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0%'
  return `${num.toFixed(decimals)}%`
}

export function parseAmount(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  const cleaned = String(raw ?? '').replace(/[^\d.-]/g, '')
  const value = Number.parseFloat(cleaned)
  return Number.isFinite(value) ? value : 0
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function monthsLabel(months) {
  if (!Number.isFinite(months)) return '—'
  const rounded = Math.ceil(months)
  if (rounded <= 0) return '0 months'
  if (rounded === 1) return '1 month'
  if (rounded < 12) return `${rounded} months`
  const years = Math.floor(rounded / 12)
  const rest = rounded % 12
  const yearText = years === 1 ? '1 year' : `${years} years`
  return rest ? `${yearText} and ${rest} months` : yearText
}

export function addMonths(date, months) {
  const result = new Date(date.getTime())
  const day = result.getDate()
  result.setMonth(result.getMonth() + Math.ceil(months))
  if (result.getDate() < day) result.setDate(0)
  return result
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' })
}
