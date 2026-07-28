import { MonthlyFinanceProvider } from './context/MonthlyFinanceContext'
import { PresenceProvider } from './context/PresenceContext'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  return (
    <MonthlyFinanceProvider>
      <PresenceProvider>
        <Dashboard />
      </PresenceProvider>
    </MonthlyFinanceProvider>
  )
}
