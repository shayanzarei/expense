import { useEffect, useState } from 'react'
import { useFinance } from '../context/MonthlyFinanceContext'
import type { PersonName } from '../types'

type BudgetField = 'vorodi' | 'shakhsi'

interface Props {
  person: PersonName
  field: BudgetField
}

export function PersonBudgetInput({ person, field }: Props) {
  const { budgetForPerson, updateBudget } = useFinance()
  const saved = budgetForPerson(person)?.[field] ?? 0
  const [value, setValue] = useState(String(saved))

  useEffect(() => {
    setValue(String(saved))
  }, [person, field, saved])

  const save = () => {
    const parsed = parseFloat(value)
    const next = Number.isNaN(parsed) ? 0 : parsed
    if (next === saved) return
    void updateBudget(person, { [field]: next })
  }

  return (
    <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2">
      <input
        type="number"
        inputMode="decimal"
        className="w-full bg-transparent py-2.5 text-base font-semibold tabular-nums outline-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />
      <span className="shrink-0 text-sm text-[var(--color-muted)]">€</span>
    </div>
  )
}
