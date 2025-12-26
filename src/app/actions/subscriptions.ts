'use server'

import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription, calculate_monthly_cost } from '@/services/subscriptions'

export async function getSubscriptionsAction() {
  return await getSubscriptions()
}

export async function createSubscriptionAction(data: Parameters<typeof createSubscription>[0]) {
  return await createSubscription(data)
}

export async function updateSubscriptionAction(data: Parameters<typeof updateSubscription>[0]) {
  return await updateSubscription(data)
}

export async function deleteSubscriptionAction(id: number) {
  return await deleteSubscription(id)
}

export async function getMonthlyCostAction() {
  const subscriptions = await getSubscriptions()
  return calculate_monthly_cost(subscriptions)
}

