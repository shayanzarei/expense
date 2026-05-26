import { PersonBudgetInput } from './PersonBudgetInput'
import { PERSON_LABELS, SHAKHSI_DEFAULT, type PersonName } from '../types'

export function ShakhsiBudget() {
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
              <PersonBudgetInput person={person} field="shakhsi" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
