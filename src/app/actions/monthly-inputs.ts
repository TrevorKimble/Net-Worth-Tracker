'use server'

import { getMonthlyInputs, createMonthlyInput, updateMonthlyInput, getMonthlyInputByMonthYear } from '@/services/monthly-inputs'

export async function getMonthlyInputsAction() {
  return await getMonthlyInputs()
}

export async function createMonthlyInputAction(data: Parameters<typeof createMonthlyInput>[0]) {
  return await createMonthlyInput(data)
}

export async function updateMonthlyInputAction(data: Parameters<typeof updateMonthlyInput>[0]) {
  return await updateMonthlyInput(data)
}

export async function getMonthlyInputByMonthYearAction(month: number, year: number) {
  return await getMonthlyInputByMonthYear(month, year)
}



