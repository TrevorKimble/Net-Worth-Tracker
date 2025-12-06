'use server'

import { getIncomeEntries, createIncomeEntry, updateIncomeEntry, deleteIncomeEntry } from '@/services/income'

export async function getIncomeEntriesAction() {
  return await getIncomeEntries()
}

export async function createIncomeEntryAction(data: Parameters<typeof createIncomeEntry>[0]) {
  return await createIncomeEntry(data)
}

export async function updateIncomeEntryAction(data: Parameters<typeof updateIncomeEntry>[0]) {
  return await updateIncomeEntry(data)
}

export async function deleteIncomeEntryAction(id: number) {
  return await deleteIncomeEntry(id)
}



