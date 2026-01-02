'use server'

import { createClient } from '@/lib/supabase/server'
import { PriceService } from '@/lib/priceService'
import { getPersonalAssets, getSolo401kAssets } from './assets'

function format_date(): string {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`
}

interface UpdateResult {
  updated: number
  failed: number
  errors: Array<{symbol: string, error: string}>
}

export async function updateAllAssetPrices(): Promise<UpdateResult> {
  const supabase = await createClient()
  const priceService = PriceService.getInstance()
  
  const result: UpdateResult = {
    updated: 0,
    failed: 0,
    errors: []
  }

  try {
    // Fetch all assets from both tables
    const [personal_assets, solo_401k_assets] = await Promise.all([
      getPersonalAssets(),
      getSolo401kAssets()
    ])

    // Combine assets with their table names, and filter out CASH and MISC assets
    const all_assets_with_table = [
      ...personal_assets.map(asset => ({ ...asset, _table: 'personal_assets' as const })),
      ...solo_401k_assets.map(asset => ({ ...asset, _table: 'solo_401k_assets' as const }))
    ]
    
    const chartable_assets = all_assets_with_table.filter(
      asset => asset.type !== 'CASH' && asset.type !== 'MISC'
    )

    const current_date = format_date()

    // Process each asset
    for (const asset of chartable_assets) {
      try {
        // Use the tracked table name
        const table_name = asset._table

        // Get current price based on asset type
        let current_price: number
        switch (asset.type) {
          case 'STOCK':
            current_price = await priceService.getStockPrice(asset.symbol)
            break
          case 'CRYPTO':
            current_price = await priceService.getCryptoPrice(asset.symbol)
            break
          case 'GOLD':
            current_price = await priceService.getPreciousMetalPrice('GOLD')
            break
          case 'SILVER':
            current_price = await priceService.getPreciousMetalPrice('SILVER')
            break
          default:
            continue // Skip unknown types
        }

        // Calculate total value
        const total_value = asset.quantity * current_price

        // Update database
        const { error } = await supabase
          .from(table_name)
          .update({
            currentPrice: current_price,
            totalValue: total_value,
            lastUpdated: current_date,
            updatedAt: current_date
          })
          .eq('id', asset.id)
          .eq('symbol', asset.symbol) // Double-check with symbol too
        
        if (error) {
          console.error(`[BATCH UPDATE] Database error for ${asset.symbol}:`, error)
          throw new Error(`Database update failed: ${error.message}`)
        }

        result.updated++
      } catch (error) {
        result.failed++
        const error_message = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push({
          symbol: asset.symbol,
          error: error_message
        })
        console.error(`Error updating price for ${asset.symbol} (${asset.type}):`, error)
      }
    }

    return result
  } catch (error) {
    console.error('Error in updateAllAssetPrices:', error)
    throw error
  }
}

