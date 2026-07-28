import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur } from '../lib/math-engine'
import { PERSON_LABELS, SHAKHSI_DEFAULT, type PersonName } from '../types'
import { PersonAvatar, SectionHeading } from './DesignPrimitives'
import { PersonBudgetInput } from './PersonBudgetInput'

export function ShakhsiBudget() {
  const { calculations } = useFinance()
  const total = calculations.aryana.shakhsi + calculations.shayan.shakhsi

  return (
    <section className="mx-4 mt-5">
      <SectionHeading
        mark="shakhsi"
        title="Shakhsi"
        total={formatEur(total)}
        subtitle={`Pocket money kept from salary — often ${SHAKHSI_DEFAULT}€, adjust per month. Not sent to ABN.`}
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
            <PersonBudgetInput person={person} field="shakhsi" />
          </div>
        ))}
      </div>
    </section>
  )
}
