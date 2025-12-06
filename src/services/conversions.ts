import { createClient } from '@/lib/supabase/server'

interface Solo401kConversion {
  id: number
  date: string
  amount: number
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface CreateConversionData {
  date: string
  amount: number
  notes?: string | null
}

interface UpdateConversionData {
  id: number
  date: string
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

export async function getConversions(): Promise<Solo401kConversion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('solo_401k_conversions')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching conversions:', error)
    throw new Error(`Failed to fetch conversions: ${error.message}`)
  }

  return data as Solo401kConversion[]
}

export async function createConversion(conversion_data: CreateConversionData): Promise<Solo401kConversion> {
  const supabase = await createClient()
  const { date, amount, notes } = conversion_data

  if (!date || amount === undefined) {
    throw new Error('Date and amount are required')
  }

  const current_date = format_date()
  const formatted_date = format_provided_date(date)

  const { data, error } = await supabase
    .from('solo_401k_conversions')
    .insert({
      date: formatted_date,
      amount: parseFloat(amount.toString()),
      notes: notes || null,
      createdAt: current_date,
      updatedAt: current_date
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversion:', error)
    throw new Error(`Failed to save conversion: ${error.message}`)
  }

  return data as Solo401kConversion
}

export async function updateConversion(conversion_data: UpdateConversionData): Promise<Solo401kConversion> {
  const supabase = await createClient()
  const { id, date, amount, notes } = conversion_data

  if (!date || amount === undefined) {
    throw new Error('Date and amount are required')
  }

  const current_date = format_date()
  const formatted_date = format_provided_date(date)

  const { data, error } = await supabase
    .from('solo_401k_conversions')
    .update({
      date: formatted_date,
      amount: parseFloat(amount.toString()),
      notes: notes || null,
      updatedAt: current_date
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversion:', error)
    throw new Error(`Failed to update conversion: ${error.message}`)
  }

  return data as Solo401kConversion
}

export async function deleteConversion(id: number): Promise<void> {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Conversion ID is required')
  }

  const { error } = await supabase
    .from('solo_401k_conversions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting conversion:', error)
    throw new Error(`Failed to delete conversion: ${error.message}`)
  }
}



