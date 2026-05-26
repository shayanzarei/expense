export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      monthly_budgets: {
        Row: {
          id: string
          year_month: string
          person: 'aryana' | 'shayan'
          vorodi: number
          shakhsi: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year_month: string
          person: 'aryana' | 'shayan'
          vorodi?: number
          shakhsi?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year_month?: string
          person?: 'aryana' | 'shayan'
          vorodi?: number
          shakhsi?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      khoroji_items: {
        Row: {
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
        Insert: {
          id?: string
          monthly_budget_id: string
          label?: string
          amount?: number
          is_checked?: boolean
          is_warning?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          monthly_budget_id?: string
          label?: string
          amount?: number
          is_checked?: boolean
          is_warning?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'khoroji_items_monthly_budget_id_fkey'
            columns: ['monthly_budget_id']
            isOneToOne: false
            referencedRelation: 'monthly_budgets'
            referencedColumns: ['id']
          },
        ]
      }
      weekly_grocery_logs: {
        Row: {
          id: string
          year_month: string
          week_number: number
          amount_used: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year_month: string
          week_number: number
          amount_used?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year_month?: string
          week_number?: number
          amount_used?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      monthly_grocery_meta: {
        Row: {
          id: string
          year_month: string
          lona_amount_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year_month: string
          lona_amount_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year_month?: string
          lona_amount_used?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      person_name: 'aryana' | 'shayan'
    }
    CompositeTypes: Record<string, never>
  }
}
