import { createClient } from '@/lib/supabase/server'
import { PriceService } from '@/lib/priceService'

type AssetType = 'CASH' | 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER' | 'MISC'

interface Asset {
  id: number
  symbol: string
  name: string
  type: AssetType
  quantity: number
  currentPrice: number
  totalValue: number
  notes: string | null
  lastUpdated: string
  createdAt: string
  updatedAt: string
}

interface CreateAssetData {
  symbol: string
  name: string
  type: AssetType
  quantity: number
  notes?: string | null
}

interface UpdateAssetData {
  id: number
  symbol: string
  name: string
  type: AssetType
  quantity: number
  notes?: string | null
}

function format_date(): string {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`
}

export async function getAssets(table_name: 'personal_assets' | 'solo_401k_assets'): Promise<Asset[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from(table_name)
    .select('*')
    .order('symbol', { ascending: true })

  if (error) {
    console.error(`Error fetching ${table_name}:`, error)
    throw new Error(`Failed to fetch assets: ${error.message}`)
  }

  return data as Asset[]
}

export async function createAsset(
  table_name: 'personal_assets' | 'solo_401k_assets',
  asset_data: CreateAssetData
): Promise<Asset> {
  const supabase = await createClient()
  const { symbol, name, type, quantity, notes } = asset_data

  if (!symbol || !name || !type || quantity === undefined) {
    throw new Error('Missing required fields')
  }

  // Get current price and calculate total value
  let current_price: number
  let total_value: number
  
  if (type === 'CASH' || type === 'MISC') {
    // For cash and misc, quantity IS the total value
    current_price = 1.00
    total_value = quantity
  } else {
    // For stocks, crypto, gold, silver - multiply quantity by price
    const price_service = PriceService.getInstance()
    current_price = await price_service.getPrice(symbol, type as any)
    total_value = quantity * current_price
  }

  const current_date = format_date()

  const { data, error } = await supabase
    .from(table_name)
    .insert({
      symbol,
      name,
      type,
      quantity,
      currentPrice: current_price,
      totalValue: total_value,
      notes: notes || null,
      lastUpdated: current_date,
      createdAt: current_date,
      updatedAt: current_date
    })
    .select()
    .single()

  if (error) {
    console.error(`Error creating asset in ${table_name}:`, error)
    throw new Error(`Failed to create asset: ${error.message}`)
  }

  return data as Asset
}

export async function updateAsset(
  table_name: 'personal_assets' | 'solo_401k_assets',
  asset_data: UpdateAssetData
): Promise<Asset> {
  const supabase = await createClient()
  const { id, symbol, name, type, quantity, notes } = asset_data

  if (!id || !symbol || !name || !type || quantity === undefined) {
    throw new Error('Missing required fields')
  }

  // Get current price and calculate total value
  let current_price: number
  let total_value: number
  
  if (type === 'CASH' || type === 'MISC') {
    current_price = 1.00
    total_value = quantity
  } else {
    const price_service = PriceService.getInstance()
    current_price = await price_service.getPrice(symbol, type as any)
    total_value = quantity * current_price
  }

  const current_date = format_date()

  const { data, error } = await supabase
    .from(table_name)
    .update({
      symbol,
      name,
      type,
      quantity,
      currentPrice: current_price,
      totalValue: total_value,
      notes: notes || null,
      lastUpdated: current_date,
      updatedAt: current_date
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating asset in ${table_name}:`, error)
    throw new Error(`Failed to update asset: ${error.message}`)
  }

  return data as Asset
}

export async function deleteAsset(
  table_name: 'personal_assets' | 'solo_401k_assets',
  id: number
): Promise<void> {
  const supabase = await createClient()

  if (!id) {
    throw new Error('Asset ID is required')
  }

  // Check if asset exists
  const { data: existing_asset, error: fetch_error } = await supabase
    .from(table_name)
    .select('id')
    .eq('id', id)
    .single()

  if (fetch_error || !existing_asset) {
    throw new Error('Asset not found')
  }

  const { error } = await supabase
    .from(table_name)
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Error deleting asset from ${table_name}:`, error)
    throw new Error(`Failed to delete asset: ${error.message}`)
  }
}



