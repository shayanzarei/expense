import { useEffect, useState } from 'react'
import { useFinance } from '../context/MonthlyFinanceContext'
import type { KhorojiItem } from '../types'

interface Props {
  item: KhorojiItem
}

export function KhorojiItemRow({ item }: Props) {
  const { updateKhoroji, deleteKhoroji } = useFinance()
  const [label, setLabel] = useState(item.label)
  const [amount, setAmount] = useState(String(item.amount))

  useEffect(() => {
    setLabel(item.label)
    setAmount(String(item.amount))
  }, [item.id, item.label, item.amount])

  const saveLabel = () => {
    const trimmed = label.trim()
    if (trimmed === item.label) return
    void updateKhoroji(item.id, { label: trimmed || item.label })
  }

  const saveAmount = () => {
    const parsed = parseFloat(amount)
    const next = Number.isNaN(parsed) ? 0 : parsed
    if (next === item.amount) return
    void updateKhoroji(item.id, { amount: next })
  }

  const toggleChecked = () =>
    void updateKhoroji(item.id, { is_checked: !item.is_checked })

  const onDelete = () => {
    if (!window.confirm(`Delete "${item.label}"?`)) return
    void deleteKhoroji(item.id)
  }

  return (
    <li className="flex items-center gap-2 border-b border-[var(--color-border)] py-2.5 last:border-0">
      <button
        type="button"
        onClick={toggleChecked}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-base"
        aria-label={item.is_checked ? 'Mark unpaid' : 'Mark paid'}
      >
        {item.is_checked ? '✅' : '○'}
      </button>

      <input
        type="text"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={saveLabel}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />

      <div className="flex shrink-0 items-center gap-1">
        <input
          type="number"
          inputMode="decimal"
          className="w-16 rounded-md border border-[var(--color-border)] bg-white px-1.5 py-1 text-right text-sm font-medium tabular-nums"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={saveAmount}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
        />
        <span className="text-sm text-[var(--color-muted)]">€</span>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="flex h-8 w-8 shrink-0 items-center justify-center text-sm text-red-500/80 active:text-red-600"
        aria-label="Delete expense"
      >
        ✕
      </button>
    </li>
  )
}
