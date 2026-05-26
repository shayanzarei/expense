import { AppTitle } from '../components/AppTitle'
import { EmptyMonthBanner } from '../components/EmptyMonthBanner'
import { IncomeHeader } from '../components/IncomeHeader'
import { KhorojiLists } from '../components/KhorojiList'
import { ShakhsiBudget } from '../components/ShakhsiBudget'
import { MonthSelector } from '../components/MonthSelector'
import { TransferResultCard } from '../components/TransferResultCard'
import { WeeklyTracker } from '../components/WeeklyTracker'
import { useFinance } from '../context/MonthlyFinanceContext'

export function Dashboard() {
  const { loading, error } = useFinance()

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-[var(--color-surface)]">
      <AppTitle />
      <MonthSelector />

      {error && (
        <div className="mx-4 mt-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24 text-sm text-[var(--color-muted)]">
          Loading…
        </div>
      ) : (
        <>
          <EmptyMonthBanner />
          <IncomeHeader />
          <KhorojiLists />
          <ShakhsiBudget />
          <TransferResultCard />
          <WeeklyTracker />
        </>
      )}
    </div>
  )
}
