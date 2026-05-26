import type { KhorojiItem, MonthlyBudget, WeeklyGroceryLog } from '../types'

export function isMonthEmpty(
  budgets: MonthlyBudget[],
  khoroji: KhorojiItem[],
  groceryLogs: WeeklyGroceryLog[],
  lonaUsed = 0,
): boolean {
  const hasIncome = budgets.some((b) => b.vorodi > 0)
  const hasKhoroji = khoroji.some((k) => k.amount > 0 || k.label.trim().length > 0)
  const hasGrocery = groceryLogs.some((g) => g.amount_used > 0) || lonaUsed > 0
  return !hasIncome && !hasKhoroji && !hasGrocery
}
