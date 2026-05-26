export type PersonName = 'aryana' | 'shayan'

export const PERSON_LABELS: Record<PersonName, string> = {
  aryana: 'Aryana',
  shayan: 'Shayan',
}

/** Monthly mortgage (vam) — €2,200 household, €1,100 per person */
export const VAM_MONTHLY_TOTAL = 2200
export const HYPOTHEEK_PER_PERSON = VAM_MONTHLY_TOTAL / 2

export const BIMEH_KHONE: Record<PersonName, number> = {
  aryana: 23,
  shayan: 25,
}
export const BIMEH_KHONE_TOTAL =
  BIMEH_KHONE.aryana + BIMEH_KHONE.shayan

/** Start-of-month transfer: hypotheek + that person's house insurance */
export function abnAvaleMah(person: PersonName): number {
  return HYPOTHEEK_PER_PERSON + BIMEH_KHONE[person]
}

export const KHORDO_KHORAK_WEEKLY_TARGET = 200
export const KHORDO_KHORAK_MONTHLY_TARGET = KHORDO_KHORAK_WEEKLY_TARGET * 4
export const KHORDO_KHORAK_LONA_MONTHLY = 100
export const KHORDO_KHORAK_MONTHLY_TOTAL =
  KHORDO_KHORAK_MONTHLY_TARGET + KHORDO_KHORAK_LONA_MONTHLY

/** Each person's share of the €900 khordo khorak pool (€800 groceries + €100 Lona) */
export const KHORDO_KHORAK_PER_PERSON = KHORDO_KHORAK_MONTHLY_TOTAL / 2

export function fixedAbnAmroTransfer(person: PersonName): number {
  return abnAvaleMah(person) + KHORDO_KHORAK_PER_PERSON
}

/** Default shakhsi when creating a new month; each month can be raised or lowered per person */
export const SHAKHSI_DEFAULT = 200

export interface MonthlyBudget {
  id: string
  year_month: string
  person: PersonName
  vorodi: number
  shakhsi: number
  created_at: string
  updated_at: string
}

export interface KhorojiItem {
  id: string
  monthly_budget_id: string
  label: string
  amount: number
  is_checked: boolean
  is_warning: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface WeeklyGroceryLog {
  id: string
  year_month: string
  week_number: number
  amount_used: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface MonthlyGroceryMeta {
  id: string
  year_month: string
  lona_amount_used: number
  created_at: string
  updated_at: string
}

export interface PersonFinanceSnapshot {
  person: PersonName
  vorodi: number
  khorojiTotal: number
  shakhsi: number
  /** Khoroji + shakhsi — everything reserved from salary before ABN */
  personalReserved: number
  /** Vorodi − khoroji − shakhsi — what you can actually send to ABN this month */
  availableForAbn: number
  /** Goal transfer (avale mah + khordo share): €1,573 Aryana, €1,575 Shayan */
  abnTarget: number
  /** availableForAbn − abnTarget — positive = surplus, negative = short */
  abnDelta: number
  abnAvaleMah: number
  abnKhordoShare: number
}

export interface MonthlyCalculations {
  aryana: PersonFinanceSnapshot
  shayan: PersonFinanceSnapshot
  groceryWeeks: GroceryWeekSummary[]
  groceryMonthlyUsed: number
  groceryMonthlyRemaining: number
  lonaUsed: number
  lonaRemaining: number
  combinedMonthlyUsed: number
  combinedMonthlyRemaining: number
}

export interface GroceryWeekSummary {
  weekNumber: number
  amountUsed: number
  target: number
  delta: number
  notes: string | null
}
