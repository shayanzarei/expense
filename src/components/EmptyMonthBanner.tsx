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
    <div className="mx-4 mt-3 rounded-xl border border-dashed border-[var(--color-border)] bg-white p-4 text-center shadow-sm">
      <p className="text-sm text-[var(--color-muted)]">
        This month is empty. Start fresh or copy from{' '}
        <span className="font-medium text-[var(--color-ink)]">{prevYearMonthLabel}</span>.
      </p>
      <button
        type="button"
        disabled={duplicating}
        onClick={() => void duplicatePreviousMonth()}
        className="mt-3 w-full rounded-xl bg-[var(--color-ink)] px-4 py-3 text-sm font-semibold text-white active:opacity-90 disabled:opacity-50"
      >
        {duplicating ? 'Copying…' : `Duplicate ${prevYearMonthLabel}`}
      </button>
      <p className="mt-2 text-[10px] text-[var(--color-muted)]">
        Copies Vorodi, Shakhsi & expense lines. Resets paid flags & grocery spend.
      </p>
    </div>
  )
}
