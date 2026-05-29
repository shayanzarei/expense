import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

export function AppTitle() {
  return (
    <div className="bg-[var(--color-card)] px-4 pb-1 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="relative flex items-center justify-center">
        <h1 className="text-center text-lg font-bold tracking-tight text-[var(--color-ink)]">
          Expenses
        </h1>
        <div className="absolute right-0">
          <AnimatedThemeToggler
            variant="hexagon"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-ink)] shadow-sm active:scale-95"
          />
        </div>
      </div>
    </div>
  )
}
