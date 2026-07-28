import { PERSON_LABELS, type PersonName } from '../types'
import { usePresence } from '../context/PresenceContext'

export function LiveFooter() {
  const { localPerson, localDeviceLabel, online } = usePresence()
  const bothOnline = online.aryana && online.shayan

  return (
    <div className="mx-4 mb-[max(1.25rem,env(safe-area-inset-bottom))] mt-4 space-y-1.5 text-center text-[10px] text-[var(--color-hint)]">
      <p className="flex items-center justify-center gap-1.5 font-medium text-[var(--color-ink)]">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            bothOnline ? 'bg-[var(--color-income)]' : 'bg-[var(--color-hint)]'
          }`}
          aria-hidden
        />
        {bothOnline ? 'Both online' : 'Who’s online'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {(['aryana', 'shayan'] as PersonName[]).map((person) => (
          <span key={person} className="inline-flex items-center gap-1 tabular-nums">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                online[person] ? 'bg-[var(--color-income)]' : 'bg-[var(--color-hint)]'
              }`}
              aria-hidden
            />
            {PERSON_LABELS[person]}
            <span className={online[person] ? 'text-[var(--color-income)]' : ''}>
              {online[person] ? 'online' : 'offline'}
            </span>
          </span>
        ))}
      </div>

      <p>
        This device: {localDeviceLabel} → {PERSON_LABELS[localPerson]}
      </p>
    </div>
  )
}
