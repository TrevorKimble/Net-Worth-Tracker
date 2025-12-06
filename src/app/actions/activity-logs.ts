'use server'

import { getLogsPaginated } from '@/services/activity-logs'

export async function getLogsPaginatedAction(
  page: number = 1,
  page_size: number = 50,
  portfolio?: 'PERSONAL' | 'SOLO_401K' | 'all'
) {
  return await getLogsPaginated(page, page_size, portfolio)
}



