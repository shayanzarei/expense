import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur } from '../lib/math-engine'
import { PERSON_LABELS, type PersonName } from '../types'
import { PersonAvatar, SectionHeading } from './DesignPrimitives'
import { PersonBudgetInput } from './PersonBudgetInput'

export function IncomeHeader() {
  const { calculations } = useFinance()
  const total = calculations.aryana.vorodi + calculations.shayan.vorodi

  return (
    <section className="mx-4 mt-4">
      <SectionHeading
        mark="income"
        title="Vorodi"
        total={formatEur(total)}
        subtitle="Monthly salary — start of the flow before khoroji, shakhsi, and ABN."
      />
      <div className="glass-panel rounded-2xl px-3 py-1">
        {(['aryana', 'shayan'] as PersonName[]).map((person, i) => (
          <div
            key={person}
            className={`flex items-center gap-3 py-3 ${
              i === 0 ? 'border-b border-[var(--color-border)]' : ''
            }`}
          >
            <PersonAvatar person={person} />
            <span className="w-16 shrink-0 text-sm font-medium text-[var(--color-ink)]">
              {PERSON_LABELS[person]}
            </span>
            <PersonBudgetInput person={person} field="vorodi" />
          </div>
        ))}
      </div>
    </section>
  )
}
