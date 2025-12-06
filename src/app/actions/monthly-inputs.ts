'use server'

import { getMonthlyInputs, upsertMonthlyInput } from '@/services/monthly-inputs'

export async function getMonthlyInputsAction() {
  return await getMonthlyInputs()
}

export async function upsertMonthlyInputAction(data: Parameters<typeof upsertMonthlyInput>[0]) {
  return await upsertMonthlyInput(data)
}



