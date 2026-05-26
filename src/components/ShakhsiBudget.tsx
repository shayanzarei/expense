import { useFinance } from '../context/MonthlyFinanceContext'
import { PERSON_LABELS, SHAKHSI_DEFAULT, type PersonName } from '../types'

export function ShakhsiBudget() {
  const { budgetForPerson, updateBudget } = useFinance()

  return (
    <section className="mx-4 mt-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--color-ink)]">
        <span aria-hidden>🎯</span> Shakhsi (Personal)
      </h2>
      <p className="mb-2 text-xs text-[var(--color-muted)]">
        Pocket money kept from salary (hobbies, fun) — not sent to ABN. Adjust per month
        (often {SHAKHSI_DEFAULT}€, sometimes more or less).
      </p>
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          {(['aryana', 'shayan'] as PersonName[]).map((person) => (
            <div key={person}>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                {PERSON_LABELS[person]}
              </label>
              <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2">
                <input
                  type="number"
                  inputMode="decimal"
                  className="w-full bg-transparent py-2.5 text-base font-semibold tabular-nums outline-none"
                  value={budgetForPerson(person)?.shakhsi ?? 0}
                  onChange={(e) =>
                    void updateBudget(person, {
                      shakhsi: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <span className="shrink-0 text-sm text-[var(--color-muted)]">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
