import type { PersonName } from '../types'
import { PERSON_LABELS } from '../types'
import { usePresence } from '../context/PresenceContext'

const AVATAR_TONE: Record<PersonName, string> = {
  aryana: 'bg-[#ece8ff] text-[#5b4fd6] dark:bg-[#2a2650] dark:text-[#b4a9ff]',
  shayan: 'bg-[#e8f4ee] text-[#1f7a4d] dark:bg-[#1a3328] dark:text-[#7dcea0]',
}

export function PersonAvatar({
  person,
  size = 'md',
  online,
  dotSide = 'right',
}: {
  person: PersonName
  size?: 'sm' | 'md'
  online?: boolean
  /** Keep status dots on the outer edge when avatars overlap */
  dotSide?: 'left' | 'right'
}) {
  const dim = size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs'
  const dotPos = dotSide === 'left' ? '-bottom-0.5 -left-0.5' : '-bottom-0.5 -right-0.5'
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={`inline-flex items-center justify-center rounded-full font-semibold ${dim} ${AVATAR_TONE[person]} ${
          online === false ? 'opacity-45' : ''
        }`}
        title={`${PERSON_LABELS[person]}${online ? ' · online' : online === false ? ' · offline' : ''}`}
        aria-label={`${PERSON_LABELS[person]}${online ? ' online' : ''}`}
      >
        {PERSON_LABELS[person].charAt(0)}
      </span>
      {online !== undefined ? (
        <span
          className={`absolute z-10 h-2.5 w-2.5 rounded-full border-2 border-[var(--color-surface)] ${dotPos} ${
            online ? 'bg-[var(--color-income)]' : 'bg-[var(--color-hint)]'
          }`}
          aria-hidden
        />
      ) : null}
    </span>
  )
}

export function OverlapAvatars() {
  const { online } = usePresence()
  return (
    <div className="relative flex items-center">
      <PersonAvatar person="aryana" size="sm" online={online.aryana} dotSide="left" />
      <span className="-ml-2">
        <PersonAvatar person="shayan" size="sm" online={online.shayan} dotSide="right" />
      </span>
    </div>
  )
}

export function SectionMark({
  color,
}: {
  color: 'income' | 'expense' | 'shakhsi' | 'grocery'
}) {
  const map = {
    income: 'bg-[var(--color-income)]',
    expense: 'bg-[var(--color-expense)]',
    shakhsi: 'bg-[var(--color-shakhsi)]',
    grocery: 'bg-[var(--color-grocery)]',
  }
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${map[color]}`}
      aria-hidden
    />
  )
}

export function SectionHeading({
  mark,
  title,
  total,
  subtitle,
}: {
  mark: 'income' | 'expense' | 'shakhsi' | 'grocery'
  title: string
  total?: string
  subtitle?: string
}) {
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[var(--color-ink)]">
          <SectionMark color={mark} />
          {title}
        </h2>
        {total ? (
          <span className="text-sm font-semibold tabular-nums text-[var(--color-ink)]">
            {total}
          </span>
        ) : null}
      </div>
      {subtitle ? (
        <p className="mt-0.5 pl-3.5 text-[10px] leading-relaxed text-[var(--color-hint)]">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
