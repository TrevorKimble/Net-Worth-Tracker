'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, DollarSign, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { AssetDisplay } from "@/components/AssetDisplay"

interface PersonalAsset {
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

export default function PersonalPortfolioPage() {
  const [assets, setAssets] = useState<PersonalAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    fetchAssets()
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchAssets, 10000)
    return () => clearInterval(interval)
  }, [])

  // Countdown timer for loading bar
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 10 // Reset to 10 when it reaches 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets/personal')
      const data = await response.json()
      setAssets(data)
      setCountdown(10) // Reset countdown when new data is fetched
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAsset = async (asset_data: Omit<PersonalAsset, 'id' | 'currentPrice' | 'totalValue' | 'lastUpdated'>) => {
    const response = await fetch('/api/assets/personal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(asset_data),
    })

    if (!response.ok) {
      const error_data = await response.json()
      throw new Error(error_data.error || 'Failed to add asset')
    }

    await fetchAssets()
  }

  const handleEditAsset = async (asset: PersonalAsset) => {
    const response = await fetch('/api/assets/personal', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        quantity: asset.quantity,
        notes: asset.notes || ''
      }),
    })

    if (!response.ok) {
      const error_data = await response.json()
      throw new Error(error_data.error || 'Failed to update asset')
    }

    await fetchAssets()
  }

  const handleDeleteAsset = async (asset_id: number) => {
    const response = await fetch(`/api/assets/personal?id=${asset_id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error_data = await response.json()
      throw new Error(error_data.error || 'Failed to delete asset')
    }

    await fetchAssets()
  }

  const getTotalValue = () => {
    return assets.reduce((sum, asset) => sum + asset.totalValue, 0)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading assets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            Personal Portfolio
          </h1>
          <p className="text-gray-600 mt-2">Track your personal assets with live prices</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalValue())}</div>
              <p className="text-xs text-gray-600">{assets.length} assets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {countdown}s
              </div>
              <p className="text-xs text-gray-600">Next update in {countdown} seconds</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Asset Display Component */}
        <AssetDisplay
          assets={assets}
          countdown={countdown}
          onAdd={handleAddAsset}
          onEdit={handleEditAsset}
          onDelete={handleDeleteAsset}
          portfolio_type="personal"
          empty_state_icon={<DollarSign className="h-12 w-12 text-gray-400 mx-auto" />}
          empty_state_title="No assets yet"
          empty_state_description="Start by adding your first asset"
        />
      </div>
    </div>
  )
}
