import { useState } from 'react'
import { useFinance } from '../context/MonthlyFinanceContext'
import { formatEur, formatTransferLine } from '../lib/math-engine'
import { TRANSFER_EMOJI } from '../lib/constants'
import { PERSON_LABELS, type PersonName } from '../types'

function abnStatus(delta: number): { label: string; className: string } {
  if (delta >= 0) {
    return {
      label: delta > 0 ? `${formatEur(delta)} over target` : 'On target',
      className: 'text-green-300',
    }
  }
  return {
    label: `${formatEur(-delta)} short for ABN`,
    className: 'text-amber-300',
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

  const copyAll = async () => {
    await navigator.clipboard.writeText(lines.map((l) => l.text).join('\n'))
    setCopied('all')
    setTimeout(() => setCopied(null), 2000)
  }

  const copyOne = async (person: PersonName, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(person)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <footer className="mx-4 mt-6 mb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="overflow-hidden rounded-xl bg-[var(--color-transfer)] shadow-lg">
        <div className="flex items-center justify-between bg-black/30 px-4 py-2.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-white">
            Final Transfer to ABN AMRO
          </h2>
          <button
            type="button"
            onClick={() => void copyAll()}
            className="text-[10px] font-semibold text-white/70 underline"
          >
            {copied === 'all' ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="space-y-3 p-4">
          {lines.map(({ person, snap, text, status }) => (
            <button
              key={person}
              type="button"
              onClick={() => void copyOne(person, text)}
              className="relative w-full rounded-lg bg-black/25 p-4 text-left active:bg-black/40"
            >
              <span className="absolute right-3 top-3 text-lg">
                {TRANSFER_EMOJI[person]}
              </span>
              <p className="text-xs font-medium uppercase tracking-wide text-white/60">
                {PERSON_LABELS[person]}
              </p>

              <p className="mt-1 text-3xl font-bold tabular-nums text-white">
                {formatEur(snap.availableForAbn)}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                Available for ABN
              </p>

              <p className="mt-2 text-[10px] tabular-nums leading-relaxed text-white/55">
                {formatEur(snap.vorodi)} salary − {formatEur(snap.khorojiTotal)} khoroji
                − {formatEur(snap.shakhsi)} shakhsi
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[10px] text-white/50">
                  Target {formatEur(snap.abnTarget)}
                </span>
                <span
                  className={`text-[10px] font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                BE ABN AMRO
              </p>
              {copied === person && (
                <p className="mt-1 text-[10px] text-green-400">Copied ✓</p>
              )}
            </button>
          ))}
        </div>

        <p className="border-t border-white/10 px-4 py-3 text-[10px] leading-relaxed text-white/50">
          Flow: salary → khoroji → shakhsi → available for ABN → compare to target
          (€1,573 / €1,575). Weekly khordo + Lona below tracks how the joint account
          spends the €900 pool after you transfer.
        </p>
      </div>
    </footer>
  )
}
