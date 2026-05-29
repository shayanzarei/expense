import { PersonBudgetInput } from './PersonBudgetInput'
import { PERSON_LABELS, type PersonName } from '../types'

export function IncomeHeader() {
  return (
    <section className="mx-4 mt-4">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-[var(--color-income)]">
        <span aria-hidden>↓</span> Vorodi (Income)
      </h2>
      <p className="mb-2 text-xs leading-relaxed text-[var(--color-subtle)]">
        Monthly salary — start of the flow before khoroji, shakhsi, and ABN.
      </p>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          {(['aryana', 'shayan'] as PersonName[]).map((person) => (
            <div key={person}>
              <label className="mb-1 block text-xs text-[var(--color-muted)]">
                {PERSON_LABELS[person]}
              </label>
              <PersonBudgetInput person={person} field="vorodi" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
