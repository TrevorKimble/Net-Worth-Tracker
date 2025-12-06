import { createClient } from '@/lib/supabase/server'

interface MonthlyInput {
  id: number
  month: number
  year: number
  cash: number
  stocks: number
  crypto: number
  gold: number
  silver: number
  misc: number
  notes: string | null
  created_at: string
  updated_at: string
}

interface UpsertMonthlyInputData {
  month: number
  year: number
  cash?: number
  stocks?: number
  crypto?: number
  gold?: number
  silver?: number
  misc?: number
  notes?: string | null
}

function format_date(): string {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`
}

export async function getMonthlyInputs(): Promise<MonthlyInput[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('monthly_inputs')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    console.error('Error fetching monthly inputs:', error)
    throw new Error(`Failed to fetch monthly inputs: ${error.message}`)
  }

  return data as MonthlyInput[]
}

export async function upsertMonthlyInput(input_data: UpsertMonthlyInputData): Promise<MonthlyInput> {
  const supabase = await createClient()
  const { month, year, cash, stocks, crypto, gold, silver, misc, notes } = input_data

  if (!month || !year) {
    throw new Error('Month and year are required')
  }

  const current_date = format_date()

  const { data, error } = await supabase
    .from('monthly_inputs')
    .upsert({
      month: parseInt(month.toString()),
      year: parseInt(year.toString()),
      cash: parseFloat((cash || 0).toString()),
      stocks: parseFloat((stocks || 0).toString()),
      crypto: parseFloat((crypto || 0).toString()),
      gold: parseFloat((gold || 0).toString()),
      silver: parseFloat((silver || 0).toString()),
      misc: parseFloat((misc || 0).toString()),
      notes: notes || null,
      created_at: current_date,
      updated_at: current_date
    }, {
      onConflict: 'month,year',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting monthly input:', error)
    throw new Error(`Failed to save monthly input: ${error.message}`)
  }

  return data as MonthlyInput
}

