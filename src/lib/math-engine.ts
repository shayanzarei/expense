import type {
  KhorojiItem,
  MonthlyBudget,
  MonthlyCalculations,
  PersonFinanceSnapshot,
  PersonName,
  WeeklyGroceryLog,
} from '../types'
import {
  abnAvaleMah as avaleMahAmount,
  fixedAbnAmroTransfer,
  KHORDO_KHORAK_LONA_MONTHLY,
  KHORDO_KHORAK_MONTHLY_TARGET,
  KHORDO_KHORAK_MONTHLY_TOTAL,
  KHORDO_KHORAK_PER_PERSON,
  KHORDO_KHORAK_WEEKLY_TARGET,
} from '../types'

/**
 * Monthly flow (per person):
 * Vorodi → pay Khoroji from salary → keep Shakhsi → Available for ABN → vs target → transfer.
 * On ABN: avale mah (hypotheek + bimeh) + khordo pool (€800 weekly + €100 Lona).
 */

export function sumKhoroji(items: KhorojiItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0)
}

/**
 * ABN section: salary minus all personal outflows (khoroji + shakhsi) = what you
 * can send to ABN; compare to the fixed monthly target (€1,573 / €1,575).
 */
export function calculatePersonTransfer(
  person: PersonName,
  budget: MonthlyBudget | null,
  khorojiItems: KhorojiItem[],
): PersonFinanceSnapshot {
  const vorodi = budget?.vorodi ?? 0
  const shakhsi = budget?.shakhsi ?? 0

  const khorojiTotal = sumKhoroji(khorojiItems)
  const personalReserved = khorojiTotal + shakhsi
  const availableForAbn = vorodi - personalReserved
  const abnTarget = fixedAbnAmroTransfer(person)
  const abnDelta = availableForAbn - abnTarget

  return {
    person,
    vorodi,
    khorojiTotal,
    shakhsi,
    personalReserved,
    availableForAbn,
    abnTarget,
    abnDelta,
    abnAvaleMah: avaleMahAmount(person),
    abnKhordoShare: KHORDO_KHORAK_PER_PERSON,
  }
}

export function buildGrocerySummaries(
  logs: WeeklyGroceryLog[],
  lonaUsed: number,
) {
  const byWeek = new Map(logs.map((l) => [l.week_number, l]))
  const weeks = [1, 2, 3, 4].map((weekNumber) => {
    const log = byWeek.get(weekNumber)
    const amountUsed = log?.amount_used ?? 0
    const target = KHORDO_KHORAK_WEEKLY_TARGET
    return {
      weekNumber,
      amountUsed,
      target,
      delta: target - amountUsed,
      notes: log?.notes ?? null,
    }
  })
  const groceryMonthlyUsed = weeks.reduce((s, w) => s + w.amountUsed, 0)
  const groceryMonthlyRemaining = KHORDO_KHORAK_MONTHLY_TARGET - groceryMonthlyUsed
  const lonaRemaining = KHORDO_KHORAK_LONA_MONTHLY - lonaUsed
  const combinedMonthlyUsed = groceryMonthlyUsed + lonaUsed

  return {
    weeks,
    groceryMonthlyUsed,
    groceryMonthlyRemaining,
    lonaUsed,
    lonaRemaining,
    combinedMonthlyUsed,
    combinedMonthlyRemaining: KHORDO_KHORAK_MONTHLY_TOTAL - combinedMonthlyUsed,
  }
}

export function calculateMonthlyFinances(
  budgets: MonthlyBudget[],
  allKhoroji: KhorojiItem[],
  groceryLogs: WeeklyGroceryLog[],
  lonaUsed = 0,
): MonthlyCalculations {
  const calcFor = (person: PersonName): PersonFinanceSnapshot => {
    const budget = budgets.find((b) => b.person === person) ?? null
    const items = budget
      ? allKhoroji.filter((k) => k.monthly_budget_id === budget.id)
      : []
    return calculatePersonTransfer(person, budget, items)
  }

  const grocery = buildGrocerySummaries(groceryLogs, lonaUsed)

  return {
    aryana: calcFor('aryana'),
    shayan: calcFor('shayan'),
    groceryWeeks: grocery.weeks,
    groceryMonthlyUsed: grocery.groceryMonthlyUsed,
    groceryMonthlyRemaining: grocery.groceryMonthlyRemaining,
    lonaUsed: grocery.lonaUsed,
    lonaRemaining: grocery.lonaRemaining,
    combinedMonthlyUsed: grocery.combinedMonthlyUsed,
    combinedMonthlyRemaining: grocery.combinedMonthlyRemaining,
  }
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatTransferLine(
  person: PersonName,
  amount: number,
  emoji: string,
): string {
  const name = person.toUpperCase()
  const formatted = formatEur(amount).replace(/\s/g, '')
  return `${name} = ${formatted} BE ABN AMRO ${emoji}`
}
