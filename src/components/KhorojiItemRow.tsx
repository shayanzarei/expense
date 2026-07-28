import { useEffect, useState } from 'react'
import { useFinance } from '../context/MonthlyFinanceContext'
import type { KhorojiItem } from '../types'

interface Props {
  item: KhorojiItem
}

export function KhorojiItemRow({ item }: Props) {
  const { updateKhoroji, deleteKhoroji } = useFinance()
  const [label, setLabel] = useState(item.label)
  const [amount, setAmount] = useState(
    item.amount > 0 ? String(item.amount) : '',
  )
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setLabel(item.label)
    setAmount(item.amount > 0 ? String(item.amount) : '')
  }, [item.id, item.label, item.amount])

  const flashSaved = () => {
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 900)
  }

  const saveLabel = () => {
    const trimmed = label.trim()
    if (trimmed === item.label) return
    void updateKhoroji(item.id, { label: trimmed || item.label })
    flashSaved()
  }

  const saveAmount = () => {
    const parsed = parseFloat(amount)
    const next = Number.isNaN(parsed) ? 0 : parsed
    if (next === item.amount) return
    void updateKhoroji(item.id, { amount: next })
    flashSaved()
  }

  const toggleChecked = () =>
    void updateKhoroji(item.id, { is_checked: !item.is_checked })

  const onDelete = () => {
    if (!window.confirm(`Delete "${item.label}"?`)) return
    void deleteKhoroji(item.id)
  }

  const muted = item.is_checked

  return (
    <li
      className={`flex items-center gap-2 border-b border-[var(--color-border)] px-2 py-2.5 last:border-0 ${
        muted ? 'opacity-55' : ''
      }`}
    >
      <button
        type="button"
        onClick={toggleChecked}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          item.is_checked
            ? 'border-[var(--color-income)] bg-[var(--color-income)] text-white'
            : 'border-[var(--color-border)] bg-transparent'
        }`}
        aria-label={item.is_checked ? 'Mark unpaid' : 'Mark paid'}
      >
        {item.is_checked ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </button>

      <input
        type="text"
        className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${
          muted ? 'text-[var(--color-hint)] line-through' : 'text-[var(--color-ink)]'
        }`}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={saveLabel}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
      />

      <div className="flex shrink-0 items-center gap-1">
        <span className="text-xs text-[var(--color-hint)]">€</span>
        <input
          type="number"
          inputMode="decimal"
          className="w-[4.75rem] rounded-full glass-pill px-2 py-1 text-right text-sm font-medium tabular-nums text-[var(--color-ink)] outline-none"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={saveAmount}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur()
          }}
        />
        {justSaved ? (
          <span className="w-8 text-[9px] font-medium text-[var(--color-income)]">
            saved
          </span>
        ) : (
          <span className="w-8" />
        )}
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-[var(--color-hint)] active:bg-[var(--color-pill)] active:text-[var(--color-expense)]"
        aria-label="Delete expense"
      >
        ✕
      </button>
    </li>
  )
}
