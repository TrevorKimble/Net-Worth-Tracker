'use server'

import { createClient } from '@/lib/supabase/server'

interface IncomeEntry {
  id: number
  date: string
  income_source: string
  amount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface CreateIncomeEntryData {
  date: string
  income_source: string
  amount: number
  notes?: string | null
}

interface UpdateIncomeEntryData {
  id: number
  date: string
  income_source: string
  amount: number
  notes?: string | null
}

function format_date(): string {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`
}

function format_provided_date(date_string: string): string {
  const date_obj = new Date(date_string)
  return `${String(date_obj.getMonth() + 1).padStart(2, '0')}/${String(date_obj.getDate()).padStart(2, '0')}/${String(date_obj.getFullYear()).slice(-2)}`
}

export async function getIncomeEntries(): Promise<IncomeEntry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('income')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching income entries:', error)
    throw new Error(`Failed to fetch income entries: ${error.message}`)
  }

  return data as IncomeEntry[]
}

export async function createIncomeEntry(entry_data: CreateIncomeEntryData): Promise<IncomeEntry> {
  const supabase = await createClient()
  const { date, income_source, amount, notes } = entry_data

  if (!date || !income_source || amount === undefined) {
    throw new Error('Date, income source, and amount are required')
  }

  const current_date = format_date()
  const formatted_date = format_provided_date(date)

  const { data, error } = await supabase
    .from('income')
    .insert({
      date: formatted_date,
      income_source,
      amount: parseFloat(amount.toString()),
      notes: notes || null,
      createdAt: current_date,
      updatedAt: current_date
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating income entry:', error)
    throw new Error(`Failed to save income entry: ${error.message}`)
  }

  return data as IncomeEntry
}

export async function updateIncomeEntry(entry_data: UpdateIncomeEntryData): Promise<IncomeEntry> {
  const supabase = await createClient()
  const { id, date, income_source, amount, notes } = entry_data

  if (!date || !income_source || amount === undefined) {
    throw new Error('Date, income source, and amount are required')
  }

  const current_date = format_date()
  const formatted_date = format_provided_date(date)

  const { data, error } = await supabase
    .from('income')
    .update({
      date: formatted_date,
      income_source,
      amount: parseFloat(amount.toString()),
      notes: notes || null,
      updatedAt: current_date
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating income entry:', error)
    throw new Error(`Failed to update income entry: ${error.message}`)
  }

  return data as IncomeEntry
}

export async function deleteIncomeEntry(id: number): Promise<void> {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Income entry ID is required')
  }

  const { error } = await supabase
    .from('income')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting income entry:', error)
    throw new Error(`Failed to delete income entry: ${error.message}`)
  }
}

export async function getUniqueIncomeSources(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('income')
    .select('income_source')

  if (error) {
    console.error('Error fetching unique income sources:', error)
    throw new Error(`Failed to fetch unique income sources: ${error.message}`)
  }

  // Get unique values and filter out null/empty
  const unique_sources = Array.from(new Set(
    (data || [])
      .map(entry => entry.income_source)
      .filter((source): source is string => Boolean(source && source.trim()))
  )).sort()

  return unique_sources
}



