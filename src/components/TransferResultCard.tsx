import { useState } from 'react'
import { ShineBorder } from '@/components/ui/shine-border'
import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur, formatTransferLine } from '../lib/math-engine'
import { TRANSFER_EMOJI } from '../lib/constants'
import { PERSON_LABELS, type PersonName } from '../types'

function abnStatus(delta: number): { label: string; className: string } {
  if (delta >= 0) {
    return {
      label: delta > 0 ? `${formatEur(delta)} over target` : 'On target',
      className: 'text-green-700 dark:text-green-400',
    }
  }
  return {
    label: `${formatEur(-delta)} short for ABN`,
    className: 'text-amber-700 dark:text-amber-400',
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
      status: abnStatus(snap.abnDelta),
    }
  })

  const copyOne = async (person: PersonName, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(person)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <footer className="mx-4 mt-6 mb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-transfer)] shadow-lg">
        <ShineBorder
          borderWidth={1.5}
          duration={12}
          shineColor={['#e5e5ea', '#ffffff', '#c7c7cc', '#ffffff', '#e5e5ea']}
          className="dark:hidden"
        />
        <ShineBorder
          borderWidth={1.5}
          duration={12}
          shineColor={['#2b303a', '#4a5260', '#2b303a']}
          className="hidden dark:block"
        />
        <div className="flex items-center justify-between bg-[var(--color-transfer-header)] px-4 py-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-transfer-fg)]">
            Final Transfer to ABN AMRO
          </h2>
        </div>

        <div className="space-y-3 p-4">
          {lines.map(({ person, snap, text, status }) => (
            <button
              key={person}
              type="button"
              onClick={() => void copyOne(person, text)}
              className="relative w-full rounded-lg bg-[var(--color-transfer-panel)] p-4 text-left active:opacity-90"
            >
              <span className="absolute right-3 top-3 text-lg">
                {TRANSFER_EMOJI[person]}
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-transfer-muted-fg)]">
                {PERSON_LABELS[person]}
              </p>

              <p className="mt-1 text-3xl font-bold tabular-nums text-[var(--color-transfer-fg)]">
                {formatEur(snap.availableForAbn)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-transfer-subtle-fg)]">
                Available for ABN
              </p>

              <p className="mt-2 text-[10px] tabular-nums leading-relaxed text-[var(--color-transfer-muted-fg)]">
                {formatEur(snap.vorodi)} salary − {formatEur(snap.khorojiTotal)} khoroji
                − {formatEur(snap.shakhsi)} shakhsi
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[10px] text-[var(--color-transfer-subtle-fg)]">
                  Target {formatEur(snap.abnTarget)}
                </span>
                <span className={`text-[10px] font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-transfer-subtle-fg)]">
                BE ABN AMRO
              </p>
              {copied === person && (
                <p className="mt-1 text-[10px] font-medium text-green-700 dark:text-green-400">
                  Copied ✓
                </p>
              )}
            </button>
          ))}
        </div>

        <p className="border-t border-[var(--color-transfer-divider)] px-4 py-3 text-[10px] leading-relaxed text-[var(--color-transfer-muted-fg)]">
          Flow: salary → khoroji → shakhsi → available for ABN → compare to target
          (€1,573 / €1,575). Weekly khordo + Lona below tracks how the joint account
          spends the €900 pool after you transfer.
        </p>
      </div>
    </footer>
  )
}
