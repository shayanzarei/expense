import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur } from '../lib/math-engine'
import type { GroceryWeekSummary } from '../types'
import {
  KHORDO_KHORAK_LONA_MONTHLY,
  KHORDO_KHORAK_MONTHLY_TARGET,
  KHORDO_KHORAK_MONTHLY_TOTAL,
  KHORDO_KHORAK_WEEKLY_TARGET,
} from '../types'
import { BlurSaveNumberInput, BlurSaveTextInput } from './BlurSaveInput'

function progressColor(used: number, target: number): string {
  if (used <= 0) return 'bg-[var(--color-border)]'
  const ratio = used / target
  if (ratio > 1) return 'bg-red-500'
  if (ratio >= 0.85) return 'bg-amber-400'
  return 'bg-green-500'
}

function budgetStatusClass(ok: boolean, emphasize = false): string {
  const weight = emphasize ? 'font-medium' : 'font-semibold'
  return ok
    ? `${weight} text-green-700 dark:text-green-400`
    : `${weight} text-red-700 dark:text-red-400`
}

function GroceryWeekRow({
  week,
  onSaveAmount,
  onSaveNotes,
}: {
  week: GroceryWeekSummary
  onSaveAmount: (amount: number) => void
  onSaveNotes: (notes: string) => void
}) {
  const pct = Math.min((week.amountUsed / week.target) * 100, 100)
  const over = week.amountUsed > week.target

  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-semibold">Week {week.weekNumber}</span>
        <span className="text-xs text-[var(--color-muted)]">Target: {week.target}€</span>
      </div>

      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
        <span className="text-sm text-[var(--color-ink)]">
          {week.amountUsed > 0 ? `${formatEur(week.amountUsed)} used` : '—'}
        </span>
        <span className={`text-xs ${budgetStatusClass(week.delta >= 0)}`}>
          {week.amountUsed > 0
            ? week.delta >= 0
              ? `${formatEur(week.delta)} left`
              : `${formatEur(-week.delta)} over`
            : `${week.target}€ budget`}
        </span>
      </div>

      <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className={`h-full rounded-full transition-all ${progressColor(week.amountUsed, week.target)}`}
          style={{ width: over ? '100%' : `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-muted)]">€</span>
        <BlurSaveNumberInput
          saved={week.amountUsed}
          syncKey={week.weekNumber}
          placeholder="Amount used"
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm tabular-nums"
          onSave={onSaveAmount}
        />
      </div>
      <BlurSaveTextInput
        saved={week.notes ?? ''}
        syncKey={week.weekNumber}
        placeholder="Notes"
        className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs"
        onSave={onSaveNotes}
      />
    </li>
  )
}

export function WeeklyTracker() {
  const { calculations, upsertGroceryWeek, updateLonaUsed } = useFinance()
  const {
    groceryWeeks,
    groceryMonthlyUsed,
    groceryMonthlyRemaining,
    lonaUsed,
    lonaRemaining,
    combinedMonthlyUsed,
    combinedMonthlyRemaining,
  } = calculations

  return (
    <section className="mx-4 mt-5">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--color-grocery)]">
        <span aria-hidden>🧺</span> Khordo Khorak (Weekly Groceries)
      </h2>

      <p className="mb-3 text-xs leading-relaxed text-[var(--color-subtle)]">
        Groceries: {KHORDO_KHORAK_WEEKLY_TARGET}€/week ({formatEur(KHORDO_KHORAK_MONTHLY_TARGET)}
        /mo) · Lona: {KHORDO_KHORAK_LONA_MONTHLY}€/month
      </p>

      <ul className="space-y-3">
        {groceryWeeks.map((week) => (
          <GroceryWeekRow
            key={week.weekNumber}
            week={week}
            onSaveAmount={(amount_used) =>
              void upsertGroceryWeek(week.weekNumber, { amount_used })
            }
            onSaveNotes={(notes) =>
              void upsertGroceryWeek(week.weekNumber, { notes })
            }
          />
        ))}
      </ul>

      <div className="mt-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-sm">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-sm font-semibold">Lona (this month)</span>
          <span className="text-xs text-[var(--color-muted)]">
            Budget {KHORDO_KHORAK_LONA_MONTHLY}€
          </span>
        </div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
          <span className="text-sm text-[var(--color-ink)]">
            {lonaUsed > 0 ? `${formatEur(lonaUsed)} used` : '—'}
          </span>
          <span className={`text-xs ${budgetStatusClass(lonaRemaining >= 0)}`}>
            {lonaUsed > 0
              ? lonaRemaining >= 0
                ? `${formatEur(lonaRemaining)} left`
                : `${formatEur(-lonaRemaining)} over`
              : `${KHORDO_KHORAK_LONA_MONTHLY}€ budget`}
          </span>
        </div>
        <div className="mb-2 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className={`h-full rounded-full transition-all ${progressColor(lonaUsed, KHORDO_KHORAK_LONA_MONTHLY)}`}
            style={{
              width: `${Math.min((lonaUsed / KHORDO_KHORAK_LONA_MONTHLY) * 100, 100)}%`,
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-muted)]">€</span>
          <BlurSaveNumberInput
            saved={lonaUsed}
            syncKey="lona"
            placeholder="Lona spent this month"
            className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-sm tabular-nums"
            onSave={(v) => void updateLonaUsed(v)}
          />
        </div>
      </div>

      <p className="mb-2 mt-3 text-xs tabular-nums text-[var(--color-ink)]">
        <span className="text-[var(--color-subtle)]">Groceries only:</span>{' '}
        {formatEur(groceryMonthlyUsed)} / {formatEur(KHORDO_KHORAK_MONTHLY_TARGET)} ·{' '}
        <span className={budgetStatusClass(groceryMonthlyRemaining >= 0)}>
          {groceryMonthlyRemaining >= 0
            ? `${formatEur(groceryMonthlyRemaining)} left`
            : `${formatEur(-groceryMonthlyRemaining)} over`}
        </span>
      </p>

      <p className="text-xs tabular-nums text-[var(--color-ink)]">
        <span className="text-[var(--color-subtle)]">Combined</span> (
        {formatEur(KHORDO_KHORAK_MONTHLY_TOTAL)}): {formatEur(combinedMonthlyUsed)} used ·{' '}
        <span className={budgetStatusClass(combinedMonthlyRemaining >= 0, true)}>
          {combinedMonthlyRemaining >= 0
            ? `${formatEur(combinedMonthlyRemaining)} left`
            : `${formatEur(-combinedMonthlyRemaining)} over`}
        </span>
      </p>
    </section>
  )
}
