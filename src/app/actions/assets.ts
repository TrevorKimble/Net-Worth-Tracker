'use server'

import { getAssets, createAsset, updateAsset, deleteAsset } from '@/services/assets'

export async function getPersonalAssets() {
  return await getAssets('personal_assets')
}

export async function getSolo401kAssets() {
  return await getAssets('solo_401k_assets')
}

export async function createPersonalAsset(data: Parameters<typeof createAsset>[1]) {
  return await createAsset('personal_assets', data)
}

export async function createSolo401kAsset(data: Parameters<typeof createAsset>[1]) {
  return await createAsset('solo_401k_assets', data)
}

export async function updatePersonalAsset(data: Parameters<typeof updateAsset>[1]) {
  return await updateAsset('personal_assets', data)
}

export async function updateSolo401kAsset(data: Parameters<typeof updateAsset>[1]) {
  return await updateAsset('solo_401k_assets', data)
}

export async function deletePersonalAsset(id: number) {
  return await deleteAsset('personal_assets', id)
}

export async function deleteSolo401kAsset(id: number) {
  return await deleteAsset('solo_401k_assets', id)
}



