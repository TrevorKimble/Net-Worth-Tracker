'use server'

import { getAggregatedAssets } from '@/services/aggregated'

export async function getAggregatedAssetsAction(portfolio?: 'personal' | 'solo401k') {
  return await getAggregatedAssets(portfolio)
}



