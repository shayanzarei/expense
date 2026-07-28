import { useState } from 'react'
import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur, formatTransferLine } from '../lib/math-engine'
import { TRANSFER_EMOJI } from '../lib/constants'
import { PERSON_LABELS, type PersonName } from '../types'

function statusChip(delta: number): { label: string; className: string } {
  if (delta >= 0) {
    return {
      label: delta > 0 ? `${formatEur(delta)} over` : 'On target',
      className:
        'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30',
    }
  }
  return {
    label: `${formatEur(-delta)} short`,
    className: 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30',
  }
}

export function TransferResultCard() {
  const { calculations } = useFinance()
  const [copied, setCopied] = useState<string | null>(null)

  const persons: PersonName[] = ['aryana', 'shayan']
  const lines = persons.map((p) => {
    const snap = calculations[p]
    const transferAmount = Math.max(0, snap.availableForAbn)
    return {
      person: p,
      snap,
      text: formatTransferLine(p, transferAmount, TRANSFER_EMOJI[p]),
      status: statusChip(snap.abnDelta),
      transferAmount,
    }
  })

  const copyOne = async (person: PersonName, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(person)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section className="mx-4 mt-6">
      <div className="glass-panel overflow-hidden rounded-2xl bg-[var(--color-transfer)]">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-transfer-fg)]">
            Final transfer · ABN AMRO
          </h2>
        </div>

        <div className="space-y-3 px-3 pb-4">
          {lines.map(({ person, snap, text, status, transferAmount }) => {
            const fillRatio = Math.min(
              Math.max(transferAmount / Math.max(snap.abnTarget, 1), 0),
              1.15,
            )
            const barPct = Math.min(fillRatio * 100, 100)
            const barColor =
              snap.abnDelta >= 0 ? 'bg-emerald-400' : 'bg-amber-400'
            const notchPct = Math.min(
              (snap.abnTarget / Math.max(transferAmount, snap.abnTarget, 1)) *
                100,
              100,
            )

            return (
              <div
                key={person}
                className="rounded-2xl bg-[var(--color-transfer-panel)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-transfer-muted-fg)]">
                    {PERSON_LABELS[person]} {TRANSFER_EMOJI[person]}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="mt-2 text-[34px] font-bold leading-none tracking-tight tabular-nums text-[var(--color-transfer-fg)]">
                  {formatEur(transferAmount)}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-transfer-subtle-fg)]">
                  To transfer
                </p>

                <p className="mt-3 text-[10px] tabular-nums leading-relaxed text-[var(--color-transfer-muted-fg)]">
                  ({formatEur(snap.vorodi)} vorodi − {formatEur(snap.khorojiTotal)}{' '}
                  khoroji − {formatEur(snap.shakhsi)} shakhsi)
                </p>

                <div className="relative mt-3 h-1.5 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${barPct}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-white"
                    style={{ left: `${notchPct}%` }}
                    title={`Target ${formatEur(snap.abnTarget)}`}
                  />
                </div>
                <p className="mt-1.5 text-[9px] text-[var(--color-transfer-subtle-fg)]">
                  Target {formatEur(snap.abnTarget)}
                </p>

                <button
                  type="button"
                  onClick={() => void copyOne(person, text)}
                  className="mt-3 w-full rounded-full border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-[var(--color-transfer-fg)] active:bg-white/10"
                >
                  {copied === person ? 'Copied ✓' : 'Copy transfer text'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
