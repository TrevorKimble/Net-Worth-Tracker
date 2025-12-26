'use server'

import { createClient } from '@/lib/supabase/server'

interface Subscription {
  id: number
  name: string
  purpose: string
  category: string
  cost: number
  billing_frequency: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'BIANNUAL'
  start_date: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface CreateSubscriptionData {
  name: string
  purpose: string
  category: string
  cost: number
  billing_frequency: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'BIANNUAL'
  start_date: string
  notes?: string | null
}

interface UpdateSubscriptionData {
  id: number
  name: string
  purpose: string
  category: string
  cost: number
  billing_frequency: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'BIANNUAL'
  start_date: string
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

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching subscriptions:', error)
    throw new Error(`Failed to fetch subscriptions: ${error.message}`)
  }

  return data as Subscription[]
}

export async function createSubscription(subscription_data: CreateSubscriptionData): Promise<Subscription> {
  const supabase = await createClient()
  const { name, purpose, category, cost, billing_frequency, start_date, notes } = subscription_data

  if (!name || !purpose || !category || cost === undefined || !billing_frequency || !start_date) {
    throw new Error('Name, purpose, category, cost, billing frequency, and start date are required')
  }

  const current_date = format_date()
  const formatted_date = format_provided_date(start_date)

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      name,
      purpose,
      category,
      cost: parseFloat(cost.toString()),
      billing_frequency,
      start_date: formatted_date,
      notes: notes || null,
      createdAt: current_date,
      updatedAt: current_date
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating subscription:', error)
    throw new Error(`Failed to save subscription: ${error.message}`)
  }

  return data as Subscription
}

export async function updateSubscription(subscription_data: UpdateSubscriptionData): Promise<Subscription> {
  const supabase = await createClient()
  const { id, name, purpose, category, cost, billing_frequency, start_date, notes } = subscription_data

  if (!name || !purpose || !category || cost === undefined || !billing_frequency || !start_date) {
    throw new Error('Name, purpose, category, cost, billing frequency, and start date are required')
  }

  const current_date = format_date()
  const formatted_date = format_provided_date(start_date)

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      name,
      purpose,
      category,
      cost: parseFloat(cost.toString()),
      billing_frequency,
      start_date: formatted_date,
      notes: notes || null,
      updatedAt: current_date
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating subscription:', error)
    throw new Error(`Failed to update subscription: ${error.message}`)
  }

  return data as Subscription
}

export async function deleteSubscription(id: number): Promise<void> {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Subscription ID is required')
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting subscription:', error)
    throw new Error(`Failed to delete subscription: ${error.message}`)
  }
}

export async function calculate_monthly_cost(subscriptions: Subscription[]): Promise<number> {
  return subscriptions.reduce((total, sub) => {
    let monthly_cost = 0
    switch (sub.billing_frequency) {
      case 'MONTHLY':
        monthly_cost = sub.cost
        break
      case 'YEARLY':
        monthly_cost = sub.cost / 12
        break
      case 'QUARTERLY':
        monthly_cost = sub.cost / 3
        break
      case 'BIANNUAL':
        monthly_cost = sub.cost / 6
        break
      case 'WEEKLY':
        monthly_cost = sub.cost * 4.33 // Average weeks per month
        break
    }
    return total + monthly_cost
  }, 0)
}

export async function getMonthlyCost() {
  const subscriptions = await getSubscriptions()
  return await calculate_monthly_cost(subscriptions)
}

