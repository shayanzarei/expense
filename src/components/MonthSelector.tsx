import { useFinance } from '../context/MonthlyFinanceContext'
import {
  canGoToPreviousMonth,
  clampYearMonth,
  formatYearMonthLabel,
  monthDayProgress,
  shiftYearMonth,
} from '../lib/month-utils'

export function MonthSelector() {
  const { yearMonth, setYearMonth } = useFinance()
  const canPrev = canGoToPreviousMonth(yearMonth)
  const label = formatYearMonthLabel(yearMonth)
  const { day, daysInMonth } = monthDayProgress(yearMonth)

  const shift = (delta: number) => {
    const next = clampYearMonth(shiftYearMonth(yearMonth, delta))
    setYearMonth(next)
  }

  return (
    <header className="glass-chrome sticky top-0 z-20 px-4 pb-3 pt-1">
      <div className="glass-panel flex items-center gap-2 rounded-2xl px-2 py-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl font-light text-[var(--color-ink)] active:bg-[var(--color-pill)] disabled:opacity-30"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-[15px] font-semibold text-[var(--color-ink)]">{label}</p>
          <p className="text-[10px] text-[var(--color-hint)]">
            day {day} of {daysInMonth} · shared
          </p>
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl font-light text-[var(--color-ink)] active:bg-[var(--color-pill)]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
    </header>
  )
}
