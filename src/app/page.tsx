'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Asset {
  id: number
  symbol: string
  name: string
  type: string
  quantity: number
  currentPrice: number
  totalValue: number
  lastUpdated: string
}

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function Home() {
  const [personalAssets, setPersonalAssets] = useState<Asset[]>([])
  const [solo401kAssets, setSolo401kAssets] = useState<Asset[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [marketLoading, setMarketLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
    fetchMarketData()
  }, [])

  const fetchAssets = async () => {
    try {
      const [personalResponse, solo401kResponse] = await Promise.all([
        fetch('/api/assets/personal'),
        fetch('/api/assets/solo401k')
      ])
      
      const personalData = await personalResponse.json()
      const solo401kData = await solo401kResponse.json()
      
      setPersonalAssets(personalData)
      setSolo401kAssets(solo401kData)
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPersonalTotal = () => {
    return personalAssets.reduce((sum, asset) => sum + asset.totalValue, 0)
  }

  const getSolo401kTotal = () => {
    return solo401kAssets.reduce((sum, asset) => sum + asset.totalValue, 0)
  }

  const getCombinedTotal = () => {
    return getPersonalTotal() + getSolo401kTotal()
  }

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/prices?symbols=^GSPC,GC=F,SI=F,BTC-USD')
      const data = await response.json()
      
      const marketDataArray: MarketData[] = [
        {
          symbol: '^GSPC',
          name: 'S&P 500',
          price: data['^GSPC'] || 0,
          change: 0, // We'll calculate this if needed
          changePercent: 0
        },
        {
          symbol: 'GC=F',
          name: 'Gold',
          price: data['GC=F'] || 0,
          change: 0,
          changePercent: 0
        },
        {
          symbol: 'SI=F',
          name: 'Silver',
          price: data['SI=F'] || 0,
          change: 0,
          changePercent: 0
        },
        {
          symbol: 'BTC-USD',
          name: 'Bitcoin',
          price: data['BTC-USD'] || 0,
          change: 0,
          changePercent: 0
        }
      ]
      
      setMarketData(marketDataArray)
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setMarketLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === '^GSPC') {
      return price.toFixed(2)
    } else if (symbol === 'GC=F' || symbol === 'SI=F') {
      return formatCurrency(price)
    } else if (symbol === 'BTC-USD') {
      return formatCurrency(price)
    }
    return formatCurrency(price)
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Net Worth Tracker</h1>
          <p className="text-gray-600 mt-2">Track your financial progress with detailed asset monitoring</p>
        </div>

        {/* Combined Total */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Total Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-center">
                {loading ? "Loading..." : formatCurrency(getCombinedTotal())}
              </div>
              <p className="text-center text-blue-100 mt-2">
                Personal + Solo 401k Combined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Market Data */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Live Market Data
              </CardTitle>
              <CardDescription>Current prices for major market indicators</CardDescription>
            </CardHeader>
            <CardContent>
              {marketLoading ? (
                <div className="text-center py-4">Loading market data...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {marketData.map((item) => (
                    <div key={item.symbol} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-gray-900">{item.name}</div>
                      <div className="text-lg font-bold text-blue-600 mt-1">
                        {formatPrice(item.price, item.symbol)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{item.symbol}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Personal Portfolio
              </CardTitle>
              <CardDescription>Track your personal assets with live prices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {loading ? "Loading..." : formatCurrency(getPersonalTotal())}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {personalAssets.length} asset{personalAssets.length !== 1 ? 's' : ''}
              </p>
              <Link href="/personal">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Personal Assets
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                Solo 401k Trust
              </CardTitle>
              <CardDescription>Track your Solo 401k investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {loading ? "Loading..." : formatCurrency(getSolo401kTotal())}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {solo401kAssets.length} asset{solo401kAssets.length !== 1 ? 's' : ''}
              </p>
              <Link href="/solo401k">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Manage Solo 401k Assets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Monthly Input
              </CardTitle>
              <CardDescription>Quick monthly estimates for cash, stocks, crypto, gold, silver</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/monthly">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Monthly Estimate
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Activity Log
              </CardTitle>
              <CardDescription>View detailed transaction history and price updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/logs">
                <Button className="w-full" variant="outline">
                  View Activity Log
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}