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

  const fetchAll = useCallback(async () => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

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
      setLoading(false)
      return
    }
    if (groceryRes.error) {
      setError(groceryRes.error.message)
      setLoading(false)
      return
    }
    if (metaRes.error) {
      setError(metaRes.error.message)
      setLoading(false)
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
          setLoading(false)
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
    setLoading(false)
  }, [yearMonth])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  useEffect(() => {
    if (!supabaseConfigured) return

    const channel = supabase
      .channel(`finance-${yearMonth}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_budgets' },
        () => void fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'khoroji_items' },
        () => void fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'weekly_grocery_logs' },
        () => void fetchAll(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'monthly_grocery_meta' },
        () => void fetchAll(),
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
      const { error: err } = await supabase
        .from('monthly_budgets')
        .update(patch)
        .eq('id', budget.id)
      if (err) setError(err.message)
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
      const { error: err } = await supabase.from('khoroji_items').insert({
        monthly_budget_id: budget.id,
        label: 'Nieuwe khoroji',
        amount: 0,
        sort_order: maxOrder + 1,
      })
      if (err) setError(err.message)
    },
    [budgets, khoroji],
  )

  const updateKhoroji = useCallback(
    async (id: string, patch: Partial<KhorojiItem>) => {
      const { error: err } = await supabase
        .from('khoroji_items')
        .update(patch)
        .eq('id', id)
      if (err) setError(err.message)
    },
    [],
  )

  const deleteKhoroji = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('khoroji_items').delete().eq('id', id)
    if (err) setError(err.message)
  }, [])

  const upsertGroceryWeek = useCallback(
    async (
      weekNumber: number,
      patch: { amount_used?: number; notes?: string },
    ) => {
      const { error: err } = await supabase.from('weekly_grocery_logs').upsert(
        {
          year_month: yearMonth,
          week_number: weekNumber,
          ...patch,
        },
        { onConflict: 'year_month,week_number' },
      )
      if (err) setError(err.message)
    },
    [yearMonth],
  )

  const updateLonaUsed = useCallback(
    async (amount: number) => {
      const { error: err } = await supabase.from('monthly_grocery_meta').upsert(
        { year_month: yearMonth, lona_amount_used: amount },
        { onConflict: 'year_month' },
      )
      if (err) setError(err.message)
    },
    [yearMonth],
  )

  const khorojiForPerson = useCallback(
    (person: PersonName) => {
      const budget = budgets.find((b) => b.person === person)
      if (!budget) return []
      return khoroji
        .filter((k) => k.monthly_budget_id === budget.id)
        .sort((a, b) => a.sort_order - b.sort_order)
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

      await fetchAll()
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
