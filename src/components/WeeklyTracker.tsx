import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur } from '../lib/math-engine'
import type { GroceryWeekSummary } from '../types'
import {
  KHORDO_KHORAK_LONA_MONTHLY,
  KHORDO_KHORAK_MONTHLY_TARGET,
  KHORDO_KHORAK_MONTHLY_TOTAL,
  KHORDO_KHORAK_WEEKLY_TARGET,
} from '../types'
import { BlurSaveNumberInput } from './BlurSaveInput'
import { SectionHeading } from './DesignPrimitives'

function progressColor(used: number, target: number): string {
  if (used <= 0) return 'bg-[var(--color-border)]'
  const ratio = used / target
  if (ratio > 1) return 'bg-[var(--color-expense)]'
  if (ratio >= 0.85) return 'bg-amber-400'
  return 'bg-[var(--color-income)]'
}

function statusLabel(used: number, delta: number): {
  text: string
  className: string
} {
  if (used <= 0) {
    return { text: 'not spent yet', className: 'text-[var(--color-hint)]' }
  }
  if (delta >= 0) {
    return {
      text: `${formatEur(delta)} left`,
      className: 'text-[var(--color-income)]',
    }
  }
  return {
    text: `${formatEur(-delta)} over`,
    className: 'text-[var(--color-expense)]',
  }
}

function weekRangeLabel(weekNumber: number): string {
  const start = (weekNumber - 1) * 7 + 1
  const end = weekNumber === 4 ? 31 : weekNumber * 7
  return `${start}–${Math.min(end, 31)}`
}

function GroceryWeekRow({
  week,
  onSaveAmount,
}: {
  week: GroceryWeekSummary
  onSaveAmount: (amount: number) => void
}) {
  const pct = Math.min((week.amountUsed / week.target) * 100, 100)
  const over = week.amountUsed > week.target
  const status = statusLabel(week.amountUsed, week.delta)

  return (
    <li className="border-b border-[var(--color-border)] px-3 py-3 last:border-0">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            Week {week.weekNumber}
          </span>
          <span className="ml-2 text-[10px] text-[var(--color-hint)]">
            {weekRangeLabel(week.weekNumber)} · target {formatEur(week.target)}
          </span>
        </div>
        <span className={`text-[11px] font-semibold tabular-nums ${status.className}`}>
          {status.text}
        </span>
      </div>

      <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${progressColor(week.amountUsed, week.target)}`}
          style={{ width: over ? '100%' : `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-hint)]">€</span>
        <BlurSaveNumberInput
          saved={week.amountUsed}
          syncKey={week.weekNumber}
          placeholder="0"
          className="flex-1 rounded-full glass-pill px-3 py-1.5 text-sm tabular-nums"
          onSave={onSaveAmount}
        />
      </div>
    </li>
  )
}

export function WeeklyTracker() {
  const { calculations, upsertGroceryWeek, updateLonaUsed } = useFinance()
  const {
    groceryWeeks,
    groceryMonthlyUsed,
    lonaUsed,
    lonaRemaining,
    combinedMonthlyRemaining,
  } = calculations

  const lonaStatus = statusLabel(lonaUsed, lonaRemaining)

  return (
    <section className="mx-4 mt-5 mb-2">
      <SectionHeading
        mark="grocery"
        title="Khordo khorak"
        total={`${formatEur(groceryMonthlyUsed)} / ${formatEur(KHORDO_KHORAK_MONTHLY_TARGET)}`}
        subtitle={`${KHORDO_KHORAK_WEEKLY_TARGET}€/week groceries · Lona ${KHORDO_KHORAK_LONA_MONTHLY}€ · pool ${formatEur(KHORDO_KHORAK_MONTHLY_TOTAL)}`}
      />

      <div className="glass-panel overflow-hidden rounded-2xl">
        <ul>
          {groceryWeeks.map((week) => (
            <GroceryWeekRow
              key={week.weekNumber}
              week={week}
              onSaveAmount={(amount_used) =>
                void upsertGroceryWeek(week.weekNumber, { amount_used })
              }
            />
          ))}
        </ul>

        <div className="border-t border-[var(--color-border)] px-3 py-3">
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-[var(--color-ink)]">Lona</span>
            <span className={`text-[11px] font-semibold tabular-nums ${lonaStatus.className}`}>
              {lonaStatus.text}
            </span>
          </div>
          <div className="mb-2.5 h-1 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all ${progressColor(lonaUsed, KHORDO_KHORAK_LONA_MONTHLY)}`}
              style={{
                width: `${Math.min((lonaUsed / KHORDO_KHORAK_LONA_MONTHLY) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-hint)]">€</span>
            <BlurSaveNumberInput
              saved={lonaUsed}
              syncKey="lona"
              placeholder="0"
              className="flex-1 rounded-full glass-pill px-3 py-1.5 text-sm tabular-nums"
              onSave={(v) => void updateLonaUsed(v)}
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] bg-white/25 px-3 py-3 dark:bg-white/5">
          <p className="text-center text-[12px] font-medium tabular-nums text-[var(--color-ink)]">
            Left in the joint pool:{' '}
            <span
              className={
                combinedMonthlyRemaining >= 0
                  ? 'text-[var(--color-income)]'
                  : 'text-[var(--color-expense)]'
              }
            >
              {formatEur(combinedMonthlyRemaining)}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
