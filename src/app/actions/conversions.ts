'use server'

import { getConversions, createConversion, updateConversion, deleteConversion } from '@/services/conversions'

export async function getConversionsAction() {
  return await getConversions()
}

export async function createConversionAction(data: Parameters<typeof createConversion>[0]) {
  return await createConversion(data)
}

export async function updateConversionAction(data: Parameters<typeof updateConversion>[0]) {
  return await updateConversion(data)
}

export async function deleteConversionAction(id: number) {
  return await deleteConversion(id)
}



