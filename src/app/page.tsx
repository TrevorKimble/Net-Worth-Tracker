'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { MonthlyInputChart } from '@/components/monthly-input-chart'
import { AssetPieChart } from '@/components/asset-pie-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface MonthlyInput {
  id: number
  month: number
  year: number
  cash: number
  stocks: number
  crypto: number
  gold: number
  silver: number
  misc: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface AssetData {
  name: string
  value: number
  type: string
}

export default function Home() {
  const [monthlyData, setMonthlyData] = useState<MonthlyInput[]>([])
  const [assetData, setAssetData] = useState<AssetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [monthlyResponse, assetResponse] = await Promise.all([
        fetch('/api/monthly-inputs'),
        fetch('/api/assets/aggregated'),
      ])

      const monthly = await monthlyResponse.json()
      const assets = await assetResponse.json()

      setMonthlyData(monthly)
      setAssetData(assets)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalValue = assetData.reduce((sum, asset) => sum + asset.value, 0)

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(totalValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on current asset values
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asset Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active asset types
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Historical data points
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <MonthlyInputChart data={monthlyData} />
          </div>
          <div className="lg:col-span-2">
            <AssetPieChart 
              data={assetData} 
              title="Asset Breakdown (All Portfolios)"
              description="Distribution of assets by type"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}