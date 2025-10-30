'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, RefreshCw, ChevronDown } from "lucide-react"
import { toast } from "sonner"

interface ActivityLog {
  id: number
  table_name: string
  record_id: number
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  portfolio: 'PERSONAL' | 'SOLO_401K' | null
  symbol: string
  name: string
  type: string
  quantity?: number
  currentPrice?: number
  totalValue?: number
  created_at: string
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
  changes?: {
    quantity?: { from: number; to: number } | null
    currentPrice?: { from: number; to: number } | null
    totalValue?: { from: number; to: number } | null
  }
}

interface ActivityLogTableProps {
  portfolio_filter?: 'PERSONAL' | 'SOLO_401K' | 'all'
}

interface ValuesDropdownProps {
  old_values?: Record<string, unknown> | null
  new_values?: Record<string, unknown> | null
}

function ValuesDropdown({ old_values, new_values }: ValuesDropdownProps) {
  const [open, setOpen] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatValueDisplay = (key: string, value: unknown): string => {
    if (value === null || value === undefined) return 'null'
    if (key === 'currentPrice' || key === 'totalValue') {
      return typeof value === 'number' ? formatCurrency(value) : String(value)
    }
    if (key === 'quantity' && typeof value === 'number') {
      return value.toLocaleString()
    }
    return String(value)
  }

  const has_data = (old_values && Object.keys(old_values).length > 0) || 
                   (new_values && Object.keys(new_values).length > 0)

  if (!has_data) {
    return <span className="text-xs text-gray-400">-</span>
  }

  const all_keys = new Set<string>()
  if (old_values) Object.keys(old_values).forEach(k => all_keys.add(k))
  if (new_values) Object.keys(new_values).forEach(k => all_keys.add(k))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          View Details
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {old_values && Object.keys(old_values).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-red-700">Old Values</h4>
              <div className="space-y-2 text-sm font-mono bg-red-50 p-3 rounded border border-red-200">
                {Array.from(all_keys).map((key) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-gray-600">{key}:</span>
                    <span className="text-right">{formatValueDisplay(key, old_values?.[key])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {new_values && Object.keys(new_values).length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-green-700">New Values</h4>
              <div className="space-y-2 text-sm font-mono bg-green-50 p-3 rounded border border-green-200">
                {Array.from(all_keys).map((key) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-gray-600">{key}:</span>
                    <span className="text-right">{formatValueDisplay(key, new_values?.[key])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!old_values && !new_values && (
            <div className="col-span-2 text-sm text-gray-500 text-center py-4">
              No details available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ActivityLogTable({ portfolio_filter = 'all' }: ActivityLogTableProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [current_page, setCurrentPage] = useState(1)
  const [total_pages, setTotalPages] = useState(1)
  const [total_count, setTotalCount] = useState(0)
  const [page_size] = useState(50) // Items per page
  const [filter, setFilter] = useState<string>(portfolio_filter)

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: page_size.toString()
      })
      
      if (filter !== 'all') {
        params.append('portfolio', filter)
      }

      const response = await fetch(`/api/logs?${params.toString()}`)
      
      if (!response.ok) {
        const error_data = await response.json()
        throw new Error(error_data.error || 'Failed to fetch logs')
      }
      
      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
        setLogs([])
        setTotalCount(0)
        setTotalPages(1)
        return
      }
      
      if (data && typeof data === 'object' && 'logs' in data) {
        setLogs(data.logs || [])
        setTotalCount(data.total || 0)
        setTotalPages(data.total_pages || 1)
        setCurrentPage(page)
      } else if (Array.isArray(data)) {
        // Fallback if API returns array directly
        setLogs(data)
        setTotalCount(data.length)
        setTotalPages(1)
        setCurrentPage(1)
      } else {
        console.error('Unexpected response format:', data)
        setLogs([])
        setTotalCount(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast.error('Failed to fetch logs')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [filter, page_size])

  useEffect(() => {
    fetchLogs(1)
  }, [fetchLogs])

  const handlePageChange = (new_page: number) => {
    if (new_page >= 1 && new_page <= total_pages) {
      fetchLogs(new_page)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDateTime = (dateString: string) => {
    try {
      if (dateString.includes('-') && dateString.includes(' ')) {
        return new Date(dateString.replace(' ', 'T')).toLocaleString()
      }
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPortfolioColor = (portfolio: string | null) => {
    if (!portfolio) return 'bg-gray-100 text-gray-800'
    return portfolio === 'PERSONAL' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Showing {logs.length > 0 ? ((current_page - 1) * page_size + 1) : 0} - {Math.min(current_page * page_size, total_count)} of {total_count} entries
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
            <Button onClick={() => fetchLogs(current_page)} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading activity logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600 mb-4">Start by adding assets to see activity logs</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Time</th>
                    <th className="text-left py-3 px-4 font-medium">Operation</th>
                    <th className="text-left py-3 px-4 font-medium">Portfolio</th>
                    <th className="text-left py-3 px-4 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Changes</th>
                    <th className="text-left py-3 px-4 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDateTime(log.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOperationColor(log.operation)}`}>
                          {log.operation}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {log.portfolio ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPortfolioColor(log.portfolio)}`}>
                            {log.portfolio === 'PERSONAL' ? 'Personal' : 'Solo 401k'}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">{log.symbol || '-'}</td>
                      <td className="py-3 px-4">{log.name || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        <div className="space-y-1">
                          {log.changes?.quantity && (
                            <div className="text-xs">
                              <span className="text-gray-600">quantity:</span>{' '}
                              <span className="text-red-600">{log.changes.quantity.from?.toLocaleString()}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">{log.changes.quantity.to?.toLocaleString()}</span>
                            </div>
                          )}
                          {log.changes?.currentPrice && (
                            <div className="text-xs">
                              <span className="text-gray-600">price:</span>{' '}
                              <span className="text-red-600">{formatCurrency(log.changes.currentPrice.from)}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">{formatCurrency(log.changes.currentPrice.to)}</span>
                            </div>
                          )}
                          {log.changes?.totalValue && (
                            <div className="text-xs">
                              <span className="text-gray-600">totalValue:</span>{' '}
                              <span className="text-red-600">{formatCurrency(log.changes.totalValue.from)}</span>
                              {' → '}
                              <span className="text-green-600 font-medium">{formatCurrency(log.changes.totalValue.to)}</span>
                            </div>
                          )}
                          {!log.changes?.quantity && !log.changes?.currentPrice && !log.changes?.totalValue && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <ValuesDropdown old_values={log.old_values} new_values={log.new_values} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {total_pages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {current_page} of {total_pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(current_page - 1)}
                    disabled={current_page <= 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(current_page + 1)}
                    disabled={current_page >= total_pages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}