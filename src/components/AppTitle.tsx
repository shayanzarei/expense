import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { OverlapAvatars } from './DesignPrimitives'

export function AppTitle() {
  return (
    <div className="glass-chrome px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--color-ink)]">
            Expenses
          </h1>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-hint)]">
            Vorodi &amp; Khoroji tracker
          </p>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <OverlapAvatars />
          <AnimatedThemeToggler
            variant="hexagon"
            className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)] active:scale-95"
          />
        </div>
      </div>
    </div>
  )
}
