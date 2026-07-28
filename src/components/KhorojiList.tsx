import { useState } from 'react'
import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur } from '../lib/math-engine'
import { PERSON_LABELS, type PersonName } from '../types'
import { SectionHeading } from './DesignPrimitives'
import { KhorojiItemRow } from './KhorojiItemRow'

export function KhorojiLists() {
  const { khorojiForPerson, addKhoroji, calculations } = useFinance()
  const [person, setPerson] = useState<PersonName>('aryana')

  const items = khorojiForPerson(person)
  const totalBoth =
    calculations.aryana.khorojiTotal + calculations.shayan.khorojiTotal

  const unpaidBoth = (['aryana', 'shayan'] as PersonName[]).reduce((sum, p) => {
    return (
      sum +
      khorojiForPerson(p)
        .filter((i) => !i.is_checked)
        .reduce((s, i) => s + i.amount, 0)
    )
  }, 0)

  const paidCount = items.filter((i) => i.is_checked).length
  const personTotal = calculations[person].khorojiTotal
  const personPaid = items
    .filter((i) => i.is_checked)
    .reduce((s, i) => s + i.amount, 0)
  const personRemaining = personTotal - personPaid
  const progressPct =
    items.length === 0 ? 0 : Math.round((paidCount / items.length) * 100)

  return (
    <section className="mx-4 mt-5">
      <SectionHeading
        mark="expense"
        title="Khoroji"
        total={formatEur(totalBoth)}
        subtitle={`${formatEur(unpaidBoth)} unpaid · bills from salary, separate from shakhsi`}
      />

      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex gap-1 border-b border-[var(--color-border)] p-1.5">
          {(['aryana', 'shayan'] as PersonName[]).map((p) => {
            const active = p === person
            const pItems = khorojiForPerson(p)
            const pPaid = pItems.filter((i) => i.is_checked).length
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPerson(p)}
                className={`flex-1 rounded-xl px-2 py-2 text-center transition-colors ${
                  active
                    ? 'glass-pill text-[var(--color-ink)] shadow-sm'
                    : 'text-[var(--color-hint)]'
                }`}
              >
                <span className="block text-xs font-semibold">
                  {PERSON_LABELS[p]}
                </span>
                <span className="mt-0.5 block text-[10px] tabular-nums text-[var(--color-hint)]">
                  {formatEur(calculations[p].khorojiTotal)} · {pPaid}/{pItems.length}
                </span>
              </button>
            )
          })}
        </div>

        {items.length > 0 ? (
          <div className="border-b border-[var(--color-border)] px-3 py-2.5">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[10px] text-[var(--color-hint)]">
              <span>
                {paidCount} of {items.length} paid · {formatEur(personPaid)} of{' '}
                {formatEur(personTotal)}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--color-expense)]">
                {formatEur(personRemaining)} left
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-[var(--color-income)] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul className="px-1">
            {items.map((item) => (
              <KhorojiItemRow key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-xs text-[var(--color-hint)]">
            No expenses yet
          </p>
        )}

        <div className="p-3 pt-1">
          <button
            type="button"
            onClick={() => void addKhoroji(person)}
            className="w-full rounded-xl border border-dashed border-[var(--color-border)] py-2.5 text-sm font-medium text-[var(--color-ink)] active:bg-[var(--color-pill)]"
          >
            + Add khoroji item
          </button>
        </div>
      </div>
    </section>
  )
}
