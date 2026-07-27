import { useCallback, useEffect, useMemo, useState } from 'react'
import { isMonthEmpty } from '../lib/month-empty'
import { calculateMonthlyFinances } from '../lib/math-engine'
import {
  clampYearMonth,
  defaultYearMonth,
  formatYearMonthLabel,
  previousYearMonth,
} from '../lib/month-utils'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type {
  KhorojiItem,
  MonthlyBudget,
  MonthlyGroceryMeta,
  PersonName,
  WeeklyGroceryLog,
} from '../types'
import { SHAKHSI_DEFAULT } from '../types'

const PERSONS: PersonName[] = ['aryana', 'shayan']

type FetchOptions = { silent?: boolean }

export function useMonthlyFinance(initialMonth = defaultYearMonth()) {
  const [yearMonth, setYearMonth] = useState(initialMonth)
  const [budgets, setBudgets] = useState<MonthlyBudget[]>([])
  const [khoroji, setKhoroji] = useState<KhorojiItem[]>([])
  const [groceryLogs, setGroceryLogs] = useState<WeeklyGroceryLog[]>([])
  const [groceryMeta, setGroceryMeta] = useState<MonthlyGroceryMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [duplicating, setDuplicating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const budgetIds = useMemo(() => budgets.map((b) => b.id), [budgets])

  const fetchAll = useCallback(async (options?: FetchOptions) => {
    const silent = options?.silent ?? false

    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    if (!silent) {
      setLoading(true)
      setError(null)
    }

    const [budgetRes, groceryRes, metaRes] = await Promise.all([
      supabase
        .from('monthly_budgets')
        .select('*')
        .eq('year_month', yearMonth),
      supabase
        .from('weekly_grocery_logs')
        .select('*')
        .eq('year_month', yearMonth)
        .order('week_number'),
      supabase
        .from('monthly_grocery_meta')
        .select('*')
        .eq('year_month', yearMonth)
        .maybeSingle(),
    ])

    if (budgetRes.error) {
      setError(budgetRes.error.message)
      if (!silent) setLoading(false)
      return
    }
    if (groceryRes.error) {
      setError(groceryRes.error.message)
      if (!silent) setLoading(false)
      return
    }
    if (metaRes.error) {
      setError(metaRes.error.message)
      if (!silent) setLoading(false)
      return
    }

    let budgetRows = (budgetRes.data ?? []) as MonthlyBudget[]

    for (const person of PERSONS) {
      if (!budgetRows.some((b) => b.person === person)) {
        const { data, error: insertErr } = await supabase
          .from('monthly_budgets')
          .insert({ year_month: yearMonth, person, shakhsi: SHAKHSI_DEFAULT })
          .select()
          .single()
        if (insertErr) {
          setError(insertErr.message)
          if (!silent) setLoading(false)
          return
        }
        if (data) budgetRows = [...budgetRows, data as MonthlyBudget]
      }
    }

    setBudgets(budgetRows)

    const ids = budgetRows.map((b) => b.id)
    const { data: khorojiData, error: khorojiErr } = await supabase
      .from('khoroji_items')
      .select('*')
      .in('monthly_budget_id', ids)
      .order('sort_order')

    if (khorojiErr) {
      setError(khorojiErr.message)
    } else {
      setKhoroji((khorojiData ?? []) as KhorojiItem[])
    }

    setGroceryLogs((groceryRes.data ?? []) as WeeklyGroceryLog[])
    setGroceryMeta((metaRes.data as MonthlyGroceryMeta | null) ?? null)
    if (!silent) setLoading(false)
  }, [yearMonth])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchAll()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchAll])

  useEffect(() => {
    if (!supabaseConfigured) return

    const channel = supabase
      .channel(`finance-${yearMonth}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_budgets' },
        () => void fetchAll({ silent: true }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'khoroji_items' },
        () => void fetchAll({ silent: true }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_grocery_logs' },
        () => void fetchAll({ silent: true }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_grocery_meta' },
        () => void fetchAll({ silent: true }),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [yearMonth, fetchAll])

  const lonaUsed = groceryMeta?.lona_amount_used ?? 0

  const calculations = useMemo(
    () => calculateMonthlyFinances(budgets, khoroji, groceryLogs, lonaUsed),
    [budgets, khoroji, groceryLogs, lonaUsed],
  )

  const monthIsEmpty = useMemo(
    () => isMonthEmpty(budgets, khoroji, groceryLogs, lonaUsed),
    [budgets, khoroji, groceryLogs, lonaUsed],
  )

  const prevYearMonth = useMemo(() => previousYearMonth(yearMonth), [yearMonth])

  const updateBudget = useCallback(
    async (
      person: PersonName,
      patch: Partial<Pick<MonthlyBudget, 'vorodi' | 'shakhsi'>>,
    ) => {
      const budget = budgets.find((b) => b.person === person)
      if (!budget) return

      const previous = budgets
      setBudgets((rows) =>
        rows.map((b) => (b.id === budget.id ? { ...b, ...patch } : b)),
      )
      setError(null)

      const { error: err } = await supabase
        .from('monthly_budgets')
        .update(patch)
        .eq('id', budget.id)
      if (err) {
        setBudgets(previous)
        setError(err.message)
      }
    },
    [budgets],
  )

  const addKhoroji = useCallback(
    async (person: PersonName) => {
      const budget = budgets.find((b) => b.person === person)
      if (!budget) return
      const maxOrder = khoroji
        .filter((k) => k.monthly_budget_id === budget.id)
        .reduce((m, k) => Math.max(m, k.sort_order), -1)

      setError(null)
      const { data, error: err } = await supabase
        .from('khoroji_items')
        .insert({
          monthly_budget_id: budget.id,
          label: 'Nieuwe khoroji',
          amount: 0,
          sort_order: maxOrder + 1,
        })
        .select()
        .single()

      if (err) {
        setError(err.message)
        return
      }
      if (data) {
        setKhoroji((rows) => [...rows, data as KhorojiItem])
      }
    },
    [budgets, khoroji],
  )

  const updateKhoroji = useCallback(
    async (id: string, patch: Partial<KhorojiItem>) => {
      const previous = khoroji
      setKhoroji((rows) =>
        rows.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      )
      setError(null)

      const { error: err } = await supabase
        .from('khoroji_items')
        .update(patch)
        .eq('id', id)
      if (err) {
        setKhoroji(previous)
        setError(err.message)
      }
    },
    [khoroji],
  )

  const deleteKhoroji = useCallback(
    async (id: string) => {
      const previous = khoroji
      setKhoroji((rows) => rows.filter((item) => item.id !== id))
      setError(null)

      const { error: err } = await supabase
        .from('khoroji_items')
        .delete()
        .eq('id', id)
      if (err) {
        setKhoroji(previous)
        setError(err.message)
      }
    },
    [khoroji],
  )

  const upsertGroceryWeek = useCallback(
    async (
      weekNumber: number,
      patch: { amount_used?: number; notes?: string },
    ) => {
      const previous = groceryLogs
      const existing = groceryLogs.find((l) => l.week_number === weekNumber)
      const now = new Date().toISOString()

      if (existing) {
        setGroceryLogs((rows) =>
          rows.map((l) =>
            l.week_number === weekNumber ? { ...l, ...patch } : l,
          ),
        )
      } else {
        setGroceryLogs((rows) => [
          ...rows,
          {
            id: `temp-${weekNumber}`,
            year_month: yearMonth,
            week_number: weekNumber,
            amount_used: patch.amount_used ?? 0,
            notes: patch.notes ?? null,
            created_at: now,
            updated_at: now,
          },
        ])
      }
      setError(null)

      const { data, error: err } = await supabase
        .from('weekly_grocery_logs')
        .upsert(
          {
            year_month: yearMonth,
            week_number: weekNumber,
            ...patch,
          },
          { onConflict: 'year_month,week_number' },
        )
        .select()
        .single()

      if (err) {
        setGroceryLogs(previous)
        setError(err.message)
        return
      }

      if (data) {
        const row = data as WeeklyGroceryLog
        setGroceryLogs((rows) => {
          const withoutTemp = rows.filter(
            (l) => l.week_number !== weekNumber || !l.id.startsWith('temp-'),
          )
          const idx = withoutTemp.findIndex((l) => l.week_number === weekNumber)
          if (idx >= 0) {
            const next = [...withoutTemp]
            next[idx] = row
            return next
          }
          return [...withoutTemp, row]
        })
      }
    },
    [groceryLogs, yearMonth],
  )

  const updateLonaUsed = useCallback(
    async (amount: number) => {
      const previous = groceryMeta
      const now = new Date().toISOString()

      if (groceryMeta) {
        setGroceryMeta({ ...groceryMeta, lona_amount_used: amount })
      } else {
        setGroceryMeta({
          id: 'temp-lona',
          year_month: yearMonth,
          lona_amount_used: amount,
          created_at: now,
          updated_at: now,
        })
      }
      setError(null)

      const { data, error: err } = await supabase
        .from('monthly_grocery_meta')
        .upsert(
          { year_month: yearMonth, lona_amount_used: amount },
          { onConflict: 'year_month' },
        )
        .select()
        .single()

      if (err) {
        setGroceryMeta(previous)
        setError(err.message)
        return
      }

      if (data) {
        setGroceryMeta(data as MonthlyGroceryMeta)
      }
    },
    [groceryMeta, yearMonth],
  )

  const khorojiForPerson = useCallback(
    (person: PersonName) => {
      const budget = budgets.find((b) => b.person === person)
      if (!budget) return []
      return khoroji
        .filter((k) => k.monthly_budget_id === budget.id)
        .sort((a, b) => {
          // Keep unpaid items at the top; paid items sink to bottom.
          if (a.is_checked !== b.is_checked) {
            return a.is_checked ? 1 : -1
          }
          return a.sort_order - b.sort_order
        })
    },
    [budgets, khoroji],
  )

  const budgetForPerson = useCallback(
    (person: PersonName) => budgets.find((b) => b.person === person) ?? null,
    [budgets],
  )

  const duplicatePreviousMonth = useCallback(async () => {
    const sourceMonth = prevYearMonth
    if (!sourceMonth) return

    setDuplicating(true)
    setError(null)

    try {
      const [srcBudgetRes, srcGroceryRes] = await Promise.all([
        supabase.from('monthly_budgets').select('*').eq('year_month', sourceMonth),
        supabase
          .from('weekly_grocery_logs')
          .select('*')
          .eq('year_month', sourceMonth),
      ])

      if (srcBudgetRes.error) throw new Error(srcBudgetRes.error.message)
      if (srcGroceryRes.error) throw new Error(srcGroceryRes.error.message)

      const srcBudgets = (srcBudgetRes.data ?? []) as MonthlyBudget[]
      const srcGrocery = (srcGroceryRes.data ?? []) as WeeklyGroceryLog[]

      for (const person of PERSONS) {
        const src = srcBudgets.find((b) => b.person === person)
        const dest = budgets.find((b) => b.person === person)
        if (!src || !dest) continue

        const { error: updErr } = await supabase
          .from('monthly_budgets')
          .update({ vorodi: src.vorodi, shakhsi: src.shakhsi })
          .eq('id', dest.id)
        if (updErr) throw new Error(updErr.message)

        const { data: srcItems, error: itemsErr } = await supabase
          .from('khoroji_items')
          .select('*')
          .eq('monthly_budget_id', src.id)
          .order('sort_order')
        if (itemsErr) throw new Error(itemsErr.message)

        const destIds = khoroji
          .filter((k) => k.monthly_budget_id === dest.id)
          .map((k) => k.id)
        if (destIds.length > 0) {
          const { error: delErr } = await supabase
            .from('khoroji_items')
            .delete()
            .in('id', destIds)
          if (delErr) throw new Error(delErr.message)
        }

        const rows = ((srcItems ?? []) as KhorojiItem[]).map((item) => ({
          monthly_budget_id: dest.id,
          label: item.label,
          amount: item.amount,
          is_checked: false,
          is_warning: false,
          sort_order: item.sort_order,
        }))
        if (rows.length > 0) {
          const { error: insErr } = await supabase.from('khoroji_items').insert(rows)
          if (insErr) throw new Error(insErr.message)
        }
      }

      for (const log of srcGrocery) {
        const { error: gErr } = await supabase.from('weekly_grocery_logs').upsert(
          {
            year_month: yearMonth,
            week_number: log.week_number,
            amount_used: 0,
            notes: null,
          },
          { onConflict: 'year_month,week_number' },
        )
        if (gErr) throw new Error(gErr.message)
      }

      await supabase.from('monthly_grocery_meta').upsert(
        { year_month: yearMonth, lona_amount_used: 0 },
        { onConflict: 'year_month' },
      )

      await fetchAll({ silent: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Duplicate failed')
    } finally {
      setDuplicating(false)
    }
  }, [prevYearMonth, budgets, khoroji, yearMonth, fetchAll])

  const setYearMonthSafe = useCallback((ym: string) => {
    setYearMonth(clampYearMonth(ym))
  }, [])

  return {
    yearMonth,
    setYearMonth: setYearMonthSafe,
    loading,
    duplicating,
    error,
    budgets,
    calculations,
    budgetIds,
    monthIsEmpty,
    prevYearMonth,
    prevYearMonthLabel: prevYearMonth
      ? formatYearMonthLabel(prevYearMonth)
      : null,
    updateBudget,
    addKhoroji,
    updateKhoroji,
    deleteKhoroji,
    upsertGroceryWeek,
    updateLonaUsed,
    duplicatePreviousMonth,
    khorojiForPerson,
    budgetForPerson,
    refetch: fetchAll,
  }
}

export type MonthlyFinanceContext = ReturnType<typeof useMonthlyFinance>
