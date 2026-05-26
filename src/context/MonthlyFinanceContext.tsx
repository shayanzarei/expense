import { createContext, useContext, type ReactNode } from 'react'
import {
  useMonthlyFinance,
  type MonthlyFinanceContext,
} from '../hooks/useMonthlyFinance'

const FinanceContext = createContext<MonthlyFinanceContext | null>(null)

export function MonthlyFinanceProvider({ children }: { children: ReactNode }) {
  const value = useMonthlyFinance()
  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  )
}

export function useFinance(): MonthlyFinanceContext {
  const ctx = useContext(FinanceContext)
  if (!ctx) {
    throw new Error('useFinance must be used within MonthlyFinanceProvider')
  }
  return ctx
}
