/** First month with data in the app */
export const FIRST_YEAR_MONTH = '2026-03'

export function parseYearMonth(ym: string): { year: number; month: number } {
  const [y, m] = ym.split('-').map(Number)
  return { year: y, month: m }
}

export function formatYearMonthLabel(ym: string): string {
  const { year, month } = parseYearMonth(ym)
  return new Date(year, month - 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })
}

export function shiftYearMonth(ym: string, delta: number): string {
  const { year, month } = parseYearMonth(ym)
  const d = new Date(year, month - 1 + delta, 1)
  const ny = d.getFullYear()
  const nm = String(d.getMonth() + 1).padStart(2, '0')
  return `${ny}-${nm}`
}

export function previousYearMonth(ym: string): string | null {
  const prev = shiftYearMonth(ym, -1)
  return prev < FIRST_YEAR_MONTH ? null : prev
}

export function clampYearMonth(ym: string): string {
  return ym < FIRST_YEAR_MONTH ? FIRST_YEAR_MONTH : ym
}

export function defaultYearMonth(): string {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return clampYearMonth(ym)
}

export function canGoToPreviousMonth(ym: string): boolean {
  return ym > FIRST_YEAR_MONTH
}
