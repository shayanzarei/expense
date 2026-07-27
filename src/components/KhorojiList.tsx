import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur } from '../lib/math-engine'
import { PERSON_LABELS, type PersonName } from '../types'
import { KhorojiItemRow } from './KhorojiItemRow'

export function KhorojiLists() {
  return (
    <section className="mx-4 mt-5 space-y-4">
      {(['aryana', 'shayan'] as PersonName[]).map((person) => (
        <KhorojiSection key={person} person={person} />
      ))}
    </section>
  )
}

function KhorojiSection({ person }: { person: PersonName }) {
  const { khorojiForPerson, addKhoroji, calculations } = useFinance()
  const items = khorojiForPerson(person)
  const total = calculations[person].khorojiTotal
  const checkedTotal = items
    .filter((item) => item.is_checked)
    .reduce((sum, item) => sum + item.amount, 0)
  const remaining = total - checkedTotal

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-expense)]">
          <span aria-hidden>↑</span> Khoroji — {PERSON_LABELS[person]}
        </h2>
        <div className="mr-2 flex flex-col items-end gap-0.5 tabular-nums">
          <span className="text-sm font-semibold text-[var(--color-expense)]">
            Total {formatEur(total)}
          </span>
          <span className="text-[10px] font-medium text-[var(--color-muted)]">
            Remaining {formatEur(remaining)}
          </span>
        </div>
      </div>
      <p className="mb-2 text-[10px] leading-relaxed text-[var(--color-subtle)]">
        Bills you pay from salary — separate from €200 shakhsi for hobbies & fun.
      </p>
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 shadow-sm">
        {items.length > 0 ? (
          <ul>
            {items.map((item) => (
              <KhorojiItemRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-xs text-[var(--color-muted)]">
            No expenses yet
          </p>
        )}
        <button
          type="button"
          onClick={() => void addKhoroji(person)}
          className="my-3 w-full rounded-lg border border-dashed border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-ink)] active:bg-[var(--color-surface)]"
        >
          + Add Expense Item
        </button>
      </div>
    </div>
  )
}
