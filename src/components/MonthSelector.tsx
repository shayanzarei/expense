import { useFinance } from '../context/MonthlyFinanceContext'
import {
  canGoToPreviousMonth,
  clampYearMonth,
  formatYearMonthLabel,
  shiftYearMonth,
} from '../lib/month-utils'

export function MonthSelector() {
  const { yearMonth, setYearMonth } = useFinance()
  const canPrev = canGoToPreviousMonth(yearMonth)
  const label = formatYearMonthLabel(yearMonth)

  const shift = (delta: number) => {
    const next = clampYearMonth(shiftYearMonth(yearMonth, delta))
    setYearMonth(next)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-xl font-light text-[var(--color-ink)] shadow-sm active:scale-95 disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-base font-semibold text-[var(--color-ink)]">{label}</p>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] text-xl font-light text-[var(--color-ink)] shadow-sm active:scale-95"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
    </header>
  )
}
