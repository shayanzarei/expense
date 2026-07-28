import { useFinance } from '../context/MonthlyFinanceContext'

export function EmptyMonthBanner() {
  const {
    monthIsEmpty,
    prevYearMonth,
    prevYearMonthLabel,
    duplicatePreviousMonth,
    duplicating,
  } = useFinance()

  if (!monthIsEmpty || !prevYearMonth) return null

  return (
    <div className="glass-panel mx-4 mt-3 rounded-2xl border-dashed p-4 text-center">
      <p className="text-sm text-[var(--color-subtle)]">
        This month is empty. Start fresh or copy from{' '}
        <span className="font-medium text-[var(--color-ink)]">{prevYearMonthLabel}</span>.
      </p>
      <button
        type="button"
        disabled={duplicating}
        onClick={() => void duplicatePreviousMonth()}
        className="mt-3 w-full rounded-full border border-[var(--color-shakhsi)] px-4 py-2.5 text-sm font-semibold text-[var(--color-shakhsi)] active:bg-[var(--color-shakhsi)]/10 disabled:opacity-50"
      >
        {duplicating ? 'Copying…' : `Duplicate ${prevYearMonthLabel}`}
      </button>
      <p className="mt-2 text-[10px] text-[var(--color-hint)]">
        Copies Vorodi, Shakhsi & expense lines. Resets paid flags & grocery spend.
      </p>
    </div>
  )
}
