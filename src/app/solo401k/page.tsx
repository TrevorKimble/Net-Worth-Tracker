'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetDisplay } from "@/components/AssetDisplay"
import { AssetPieChart } from '@/components/asset-pie-chart'

interface Solo401kAsset {
  id: number
  symbol: string
  name: string
  type: 'CASH' | 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER' | 'MISC'
  quantity: number
  currentPrice: number
  totalValue: number
  notes?: string
  lastUpdated: string
}

export default function Solo401kPortfolioPage() {
  const [assets, setAssets] = useState<Solo401kAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [pieChartData, setPieChartData] = useState<Array<{ name: string; value: number; type: string }>>([])

  useEffect(() => {
    fetchAssets()
    fetchPieChartData()
    const interval = setInterval(() => {
      fetchAssets()
      fetchPieChartData()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchPieChartData()
  }, [assets])

  const fetchAssets = async () => {
    try {
      const { getSolo401kAssets } = await import('@/services/assets')
      const data = await getSolo401kAssets()
      setAssets(data)
    } catch (error) {
      console.error('Error fetching Solo 401k assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPieChartData = async () => {
    try {
      const { getAggregatedAssetsAction } = await import('@/services/aggregated')
      const data = await getAggregatedAssetsAction('solo401k')
      setPieChartData(data)
    } catch (error) {
      console.error('Error fetching pie chart data:', error)
    }
  }

  const handleAddAsset = async (asset_data: Omit<Solo401kAsset, 'id' | 'currentPrice' | 'totalValue' | 'lastUpdated'>) => {
    try {
      const { createSolo401kAsset } = await import('@/services/assets')
      await createSolo401kAsset(asset_data)
      await fetchAssets()
      await fetchPieChartData()
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add asset')
    }
  }

  const handleEditAsset = async (asset: Solo401kAsset) => {
    try {
      const { updateSolo401kAsset } = await import('@/services/assets')
      await updateSolo401kAsset({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        quantity: asset.quantity,
        notes: asset.notes || null
      })
      await fetchAssets()
      await fetchPieChartData()
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update asset')
    }
  }

  const handleDeleteAsset = async (asset_id: number) => {
    try {
      const { deleteSolo401kAsset } = await import('@/services/assets')
      await deleteSolo401kAsset(asset_id)
      await fetchAssets()
      await fetchPieChartData()
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete asset')
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solo 401k Portfolio</h1>
          <p className="text-muted-foreground mt-2">Manage your Solo 401k assets</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetPieChart 
            data={pieChartData}
            title="Solo 401k Assets Breakdown"
            description="Distribution of Solo 401k assets by type"
          />
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(assets.reduce((sum, asset) => sum + asset.totalValue, 0))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {assets.length} asset{assets.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <AssetDisplay
              assets={assets}
              loading={loading}
              onAdd={handleAddAsset}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              portfolioType="SOLO_401K"
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}