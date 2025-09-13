'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, ArrowLeft, RefreshCw, Filter } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AssetLog {
  id: number
  portfolio: 'PERSONAL' | 'SOLO_401K'
  symbol: string
  action: 'BUY' | 'SELL' | 'UPDATE_PRICE' | 'MANUAL_UPDATE' | 'INITIAL_ADD'
  quantity?: number
  price: number
  totalValue: number
  notes?: string
  createdAt: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AssetLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    try {
      const url = filter === 'all' ? '/api/logs' : `/api/logs?portfolio=${filter}`
      const response = await fetch(url)
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-100 text-green-800'
      case 'SELL':
        return 'bg-red-100 text-red-800'
      case 'UPDATE_PRICE':
        return 'bg-blue-100 text-blue-800'
      case 'MANUAL_UPDATE':
        return 'bg-yellow-100 text-yellow-800'
      case 'INITIAL_ADD':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPortfolioColor = (portfolio: string) => {
    return portfolio === 'PERSONAL' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading activity logs...</p>
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
            <TrendingUp className="h-8 w-8 text-orange-600" />
            Activity Log
          </h1>
          <p className="text-gray-600 mt-2">Detailed transaction history and price updates</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Portfolios</SelectItem>
                  <SelectItem value="PERSONAL">Personal Only</SelectItem>
                  <SelectItem value="SOLO_401K">Solo 401k Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchLogs} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              {filter === 'all' ? 'All transactions and updates' : 
               filter === 'PERSONAL' ? 'Personal portfolio activity' : 
               'Solo 401k portfolio activity'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
                <p className="text-gray-600 mb-4">Start by adding assets to see activity logs</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/personal">
                    <Button variant="outline">
                      Add Personal Asset
                    </Button>
                  </Link>
                  <Link href="/solo401k">
                    <Button variant="outline">
                      Add Solo 401k Asset
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Time</th>
                      <th className="text-left py-3 px-4 font-medium">Portfolio</th>
                      <th className="text-left py-3 px-4 font-medium">Symbol</th>
                      <th className="text-left py-3 px-4 font-medium">Action</th>
                      <th className="text-right py-3 px-4 font-medium">Quantity</th>
                      <th className="text-right py-3 px-4 font-medium">Price</th>
                      <th className="text-right py-3 px-4 font-medium">Total Value</th>
                      <th className="text-left py-3 px-4 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPortfolioColor(log.portfolio)}`}>
                            {log.portfolio === 'PERSONAL' ? 'Personal' : 'Solo 401k'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium">{log.symbol}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {log.quantity ? log.quantity.toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">{formatCurrency(log.price)}</td>
                        <td className="py-3 px-4 text-right font-mono font-medium">{formatCurrency(log.totalValue)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                          {log.notes || '-'}
                        </td>
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


