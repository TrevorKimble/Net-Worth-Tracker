'use server'

import { createClient } from '@/lib/supabase/server'

interface ActivityLog {
  id: number
  table_name: string
  record_id: number
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  old_values: any | null
  new_values: any | null
  created_at: string
}

interface ActivityLogFilters {
  table_name?: string
  record_id?: number
  operation?: 'INSERT' | 'UPDATE' | 'DELETE'
  limit?: number
}

interface PaginatedLogsResponse {
  logs: ActivityLog[]
  total: number
  page: number
  total_pages: number
  page_size: number
}

export async function getActivityLogs(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
  const supabase = await createClient()

  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('id', { ascending: false })

  if (filters?.table_name) {
    query = query.eq('table_name', filters.table_name)
  }

  if (filters?.record_id !== undefined) {
    query = query.eq('record_id', filters.record_id)
  }

  if (filters?.operation) {
    query = query.eq('operation', filters.operation)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching activity logs:', error)
    throw new Error(`Failed to fetch activity logs: ${error.message}`)
  }

  // Parse JSONB values (they come as objects, not strings)
  return (data || []).map(log => ({
    ...log,
    old_values: log.old_values,
    new_values: log.new_values
  })) as ActivityLog[]
}

export async function getLogsPaginated(
  page: number = 1,
  page_size: number = 50,
  portfolio?: 'PERSONAL' | 'SOLO_401K' | 'all'
): Promise<PaginatedLogsResponse> {
  const supabase = await createClient()

  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })

  // Build where clause
  if (portfolio && portfolio !== 'all') {
    if (portfolio === 'PERSONAL') {
      query = query.eq('table_name', 'personal_assets')
    } else if (portfolio === 'SOLO_401K') {
      query = query.eq('table_name', 'solo_401k_assets')
    }
  }

  const skip = (page - 1) * page_size

  const { data, error, count } = await query
    .order('id', { ascending: false })
    .range(skip, skip + page_size - 1)

  if (error) {
    console.error('Error fetching paginated logs:', error)
    throw new Error(`Failed to fetch logs: ${error.message}`)
  }

  const total_count = count || 0
  const total_pages = Math.ceil(total_count / page_size)

  // Parse JSONB values and format for display
  const formatted_logs = (data || []).map(log => {
    const old_values = log.old_values || null
    const new_values = log.new_values || null
    
    // Determine portfolio type from table name
    const portfolio_type = log.table_name === 'personal_assets' ? 'PERSONAL' : 
                     log.table_name === 'solo_401k_assets' ? 'SOLO_401K' : null
    
    // Extract relevant data from the JSON values
    const values = new_values || old_values || {}
    const is_update = log.operation === 'UPDATE' && old_values && new_values
    
    return {
      id: log.id,
      table_name: log.table_name,
      record_id: log.record_id,
      operation: log.operation as 'INSERT' | 'UPDATE' | 'DELETE',
      portfolio: portfolio_type as 'PERSONAL' | 'SOLO_401K' | null,
      symbol: values.symbol || '-',
      name: values.name || '-',
      type: values.type || '-',
      quantity: values.quantity,
      currentPrice: values.currentPrice || 0,
      totalValue: values.totalValue || 0,
      created_at: log.created_at,
      old_values: old_values,
      new_values: new_values,
      // For updates, show what changed - detect changes in any field
      changes: is_update ? (() => {
        const changes_obj: Record<string, { from: unknown; to: unknown }> = {}
        
        // Get all unique keys from both old and new values
        const all_keys = new Set([
          ...Object.keys(old_values || {}),
          ...Object.keys(new_values || {})
        ])
        
        // Check each key for changes (excluding id and timestamp fields)
        all_keys.forEach(key => {
          if (key.toLowerCase() === 'id' || 
              key.toLowerCase() === 'createdat' || 
              key.toLowerCase() === 'updatedat') {
            return // Skip id and timestamp fields
          }
          
          const old_val = old_values?.[key]
          const new_val = new_values?.[key]
          
          // Only include fields that actually changed
          // Handle null/undefined comparison properly
          const old_val_normalized = old_val === null || old_val === undefined ? null : old_val
          const new_val_normalized = new_val === null || new_val === undefined ? null : new_val
          
          if (old_val_normalized !== new_val_normalized) {
            changes_obj[key] = {
              from: old_val_normalized,
              to: new_val_normalized
            }
          }
        })
        
        return Object.keys(changes_obj).length > 0 ? changes_obj : null
      })() : null
    }
  })

  return {
    logs: formatted_logs as any,
    total: total_count,
    page,
    total_pages,
    page_size
  }
}

// Wrapper function for consistency with action naming
export async function getLogsPaginatedAction(
  page: number = 1,
  page_size: number = 50,
  portfolio?: 'PERSONAL' | 'SOLO_401K' | 'all'
) {
  return await getLogsPaginated(page, page_size, portfolio)
}



