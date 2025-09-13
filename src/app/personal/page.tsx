'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DollarSign, Plus, ArrowLeft, TrendingUp, RefreshCw } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface PersonalAsset {
  id: number
  symbol: string
  name: string
  type: 'CASH' | 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER' | 'MISC'
  quantity: number
  currentPrice: number
  totalValue: number
  lastUpdated: string
}

export default function PersonalPortfolioPage() {
  const [assets, setAssets] = useState<PersonalAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    type: 'STOCK' as const,
    quantity: 0
  })

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
      toast.error('Failed to fetch assets')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/assets/personal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAsset),
      })

      if (response.ok) {
        toast.success('Asset added successfully!')
        setAddDialogOpen(false)
        setNewAsset({ symbol: '', name: '', type: 'STOCK', quantity: 0 })
        fetchAssets()
      } else {
        toast.error('Failed to add asset')
      }
    } catch (error) {
      console.error('Error adding asset:', error)
      toast.error('Error adding asset')
    }
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

  const formatLastUpdated = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <Plus className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Asset
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Asset</DialogTitle>
                    <DialogDescription>
                      Add a new asset to your personal portfolio
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAsset} className="space-y-4">
                    <div>
                      <Label htmlFor="symbol">Symbol</Label>
                      <Input
                        id="symbol"
                        value={newAsset.symbol}
                        onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                        placeholder="e.g., FXAIX, AAPL, BTC"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="e.g., Fidelity 500 Index Fund"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newAsset.type}
                        onValueChange={(value: any) => setNewAsset({ ...newAsset, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="STOCK">Stock</SelectItem>
                          <SelectItem value="CRYPTO">Crypto</SelectItem>
                          <SelectItem value="GOLD">Gold</SelectItem>
                          <SelectItem value="SILVER">Silver</SelectItem>
                          <SelectItem value="MISC">Miscellaneous</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.000001"
                        value={newAsset.quantity}
                        onChange={(e) => setNewAsset({ ...newAsset, quantity: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 100 (shares), 0.5 (ounces)"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Add Asset
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>Live prices updated every 10 seconds</CardDescription>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first asset</p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Asset
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Symbol</th>
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Price</th>
                      <th className="text-right py-3 px-4 font-medium">Total Value</th>
                      <th className="text-right py-3 px-4 font-medium">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset) => (
                      <tr key={asset.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-medium">{asset.symbol}</td>
                        <td className="py-3 px-4">{asset.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            asset.type === 'STOCK' ? 'bg-blue-100 text-blue-800' :
                            asset.type === 'CRYPTO' ? 'bg-orange-100 text-orange-800' :
                            asset.type === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                            asset.type === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                            asset.type === 'CASH' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {asset.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{asset.quantity.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="font-mono">{formatCurrency(asset.currentPrice)}</div>
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Next update in {countdown}s
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium">{formatCurrency(asset.totalValue)}</td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">{formatLastUpdated(asset.lastUpdated)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
