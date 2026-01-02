'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { AssetChart } from '@/components/asset-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Wallet, Coins, Gem, CircleDollarSign } from 'lucide-react'

interface AssetData {
  name: string
  value: number
  type: string
}

export default function Home() {
  const [assetData, setAssetData] = useState<AssetData[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { getAggregatedAssetsAction } = await import('@/services/aggregated')
      const assets = await getAggregatedAssetsAction()
      setAssetData(assets)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0)

  // Get value for a specific category, defaulting to 0 if not found
  const getCategoryValue = (category_name: string): number => {
    const category = assetData.find(asset => asset.name === category_name)
    return category ? category.value : 0
  }

  // Get combined value for Gold and Silver
  const getPreciousMetalsValue = (): number => {
    return getCategoryValue('Gold') + getCategoryValue('Silver')
  }

  // Calculate percentage of total for each category
  const getPercentage = (value: number): number => {
    return totalValue > 0 ? (value / totalValue) * 100 : 0
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your financial portfolio and trends
          </p>
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
                Total Net Worth
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-5 pt-0 relative z-10">
              <div className="text-2xl font-bold tracking-tight text-foreground">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(totalValue)}
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
                }).format(getCategoryValue('Cash'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {getPercentage(getCategoryValue('Cash')).toFixed(1)}%
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
                }).format(getCategoryValue('Stocks'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {getPercentage(getCategoryValue('Stocks')).toFixed(1)}%
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
                }).format(getCategoryValue('Crypto'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {getPercentage(getCategoryValue('Crypto')).toFixed(1)}%
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
                }).format(getPreciousMetalsValue())}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {getPercentage(getPreciousMetalsValue()).toFixed(1)}%
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
                }).format(getCategoryValue('Misc'))}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5">
                {getPercentage(getCategoryValue('Misc')).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <AssetChart />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}