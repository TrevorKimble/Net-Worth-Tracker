'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AssetDisplay } from "@/components/AssetDisplay"
import { TrendingUp, Wallet, Coins, Gem, CircleDollarSign, Plus } from 'lucide-react'

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
  const [aggregated_data, setAggregatedData] = useState<Array<{ name: string; value: number; type: string }>>([])

  useEffect(() => {
    fetchAssets()
    fetchAggregatedData()
    const interval = setInterval(() => {
      fetchAssets()
      fetchAggregatedData()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchAggregatedData()
  }, [assets])

  const fetchAssets = async () => {
    try {
      const { getSolo401kAssets } = await import('@/services/assets')
      const data = await getSolo401kAssets()
      // Convert null notes to undefined for component compatibility
      const formatted_data = data.map(asset => ({
        ...asset,
        notes: asset.notes ?? undefined
      }))
      setAssets(formatted_data)
    } catch (error) {
      console.error('Error fetching Solo 401k assets:', error)
    }
  }

  const fetchAggregatedData = async () => {
    try {
      const { getAggregatedAssetsAction } = await import('@/services/aggregated')
      const data = await getAggregatedAssetsAction('solo401k')
      setAggregatedData(data)
    } catch (error) {
      console.error('Error fetching aggregated data:', error)
    }
  }

  const handleAddAsset = async (asset_data: Omit<Solo401kAsset, 'id' | 'currentPrice' | 'totalValue' | 'lastUpdated'>) => {
    try {
      const { createSolo401kAsset } = await import('@/services/assets')
      await createSolo401kAsset(asset_data)
      await fetchAssets()
      await fetchAggregatedData()
    } catch (error) {
      const error_message = error instanceof Error ? error.message : 'Failed to add asset'
      throw new Error(error_message)
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
      await fetchAggregatedData()
    } catch (error) {
      const error_message = error instanceof Error ? error.message : 'Failed to update asset'
      throw new Error(error_message)
    }
  }

  const handleDeleteAsset = async (asset_id: number) => {
    try {
      const { deleteSolo401kAsset } = await import('@/services/assets')
      await deleteSolo401kAsset(asset_id)
      await fetchAssets()
      await fetchAggregatedData()
    } catch (error) {
      const error_message = error instanceof Error ? error.message : 'Failed to delete asset'
      throw new Error(error_message)
    }
  }

  const total_value = assets.reduce((sum, asset) => sum + asset.totalValue, 0)

  // Get value for a specific category, defaulting to 0 if not found
  const get_category_value = (category_name: string): number => {
    const category = aggregated_data.find(asset => asset.name === category_name)
    return category ? category.value : 0
  }

  // Get combined value for Gold and Silver
  const get_precious_metals_value = (): number => {
    return get_category_value('Gold') + get_category_value('Silver')
  }

  // Calculate percentage of total for each category
  const get_percentage = (value: number): number => {
    return total_value > 0 ? (value / total_value) * 100 : 0
  }

  const [is_add_dialog_open, setIsAddDialogOpen] = useState(false)

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Solo 401k Portfolio</h1>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background hover:border-primary/40 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="text-center pb-3 pt-5 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(total_value)}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 via-background to-background hover:border-green-500/40 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="text-center pb-3 pt-5 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                  <Wallet className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cash
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(get_category_value('Cash'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {get_percentage(get_category_value('Cash')).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-background hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="text-center pb-3 pt-5 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(get_category_value('Stocks'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {get_percentage(get_category_value('Stocks')).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-background hover:border-orange-500/40 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="text-center pb-3 pt-5 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <Coins className="h-5 w-5 text-orange-500" />
                </div>
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Crypto
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(get_category_value('Crypto'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {get_percentage(get_category_value('Crypto')).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 via-background to-background hover:border-yellow-500/40 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="text-center pb-3 pt-5 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                  <Gem className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Gold + Silver
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(get_precious_metals_value())}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {get_percentage(get_precious_metals_value()).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-background to-background hover:border-purple-500/40 transition-all duration-300 hover:shadow-xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="text-center pb-3 pt-5 relative z-10">
              <div className="flex justify-center mb-2">
                <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <CircleDollarSign className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Misc
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(get_category_value('Misc'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {get_percentage(get_category_value('Misc')).toFixed(1)}%
              </div>
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
              countdown={0}
              onAdd={handleAddAsset}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
              portfolio_type="solo401k"
              is_add_dialog_open={is_add_dialog_open}
              on_add_dialog_change={setIsAddDialogOpen}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}