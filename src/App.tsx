import { MonthlyFinanceProvider } from './context/MonthlyFinanceContext'
import { Dashboard } from './pages/Dashboard'

export default function App() {
  return (
    <MonthlyFinanceProvider>
      <Dashboard />
    </MonthlyFinanceProvider>
  )
}
