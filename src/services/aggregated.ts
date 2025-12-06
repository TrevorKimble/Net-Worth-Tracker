import { createClient } from '@/lib/supabase/server'

interface AggregatedAsset {
  name: string
  value: number
  type: string
}

export async function getAggregatedAssets(portfolio?: 'personal' | 'solo401k'): Promise<AggregatedAsset[]> {
  const supabase = await createClient()

  let personal_assets: any[] = []
  let solo401k_assets: any[] = []

  if (!portfolio || portfolio === 'personal') {
    const { data: personal_data, error: personal_error } = await supabase
      .from('personal_assets')
      .select('name, type, totalValue')

    if (personal_error) {
      console.error('Error fetching personal assets:', personal_error)
    } else {
      personal_assets = personal_data || []
    }
  }

  if (!portfolio || portfolio === 'solo401k') {
    const { data: solo401k_data, error: solo401k_error } = await supabase
      .from('solo_401k_assets')
      .select('name, type, totalValue')

    if (solo401k_error) {
      console.error('Error fetching solo401k assets:', solo401k_error)
    } else {
      solo401k_assets = solo401k_data || []
    }
  }

  // Group by asset type
  const grouped_data: Record<string, { name: string; value: number; type: string }> = {}

  const process_assets = (assets: any[]) => {
    assets.forEach(asset => {
      const type = asset.type
      const type_name = type === 'STOCK' ? 'Stocks' :
                        type === 'CRYPTO' ? 'Crypto' :
                        type === 'GOLD' ? 'Gold' :
                        type === 'SILVER' ? 'Silver' :
                        type === 'CASH' ? 'Cash' : 'Misc'
      
      if (!grouped_data[type]) {
        grouped_data[type] = {
          name: type_name,
          value: 0,
          type: type,
        }
      }
      grouped_data[type].value += asset.totalValue || 0
    })
  }

  process_assets(personal_assets)
  process_assets(solo401k_assets)

  return Object.values(grouped_data)
}



