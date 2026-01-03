'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Autocomplete } from "@/components/ui/autocomplete"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Asset {
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

interface AssetDisplayProps {
  assets: Asset[]
  countdown: number
  onAdd: (asset: Omit<Asset, 'id' | 'currentPrice' | 'totalValue' | 'lastUpdated'>) => Promise<void>
  onEdit: (asset: Asset) => Promise<void>
  onDelete: (asset_id: number) => Promise<void>
  portfolio_type: 'personal' | 'solo401k'
  empty_state_icon?: React.ReactNode
  empty_state_title?: string
  empty_state_description?: string
  is_add_dialog_open?: boolean
  on_add_dialog_change?: (open: boolean) => void
}

export function AssetDisplay({
  assets,
  countdown,
  onAdd,
  onEdit,
  onDelete,
  portfolio_type,
  empty_state_icon,
  empty_state_title,
  empty_state_description,
  is_add_dialog_open: controlled_add_dialog_open,
  on_add_dialog_change: on_controlled_add_dialog_change
}: AssetDisplayProps) {
  const [internal_add_dialog_open, setInternalAddDialogOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const addDialogOpen = controlled_add_dialog_open !== undefined ? controlled_add_dialog_open : internal_add_dialog_open
  const setAddDialogOpen = on_controlled_add_dialog_change || setInternalAddDialogOpen
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [chartDialogOpen, setChartDialogOpen] = useState(false)
  const [selectedChartAsset, setSelectedChartAsset] = useState<Asset | null>(null)
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    type: null as 'CASH' | 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER' | 'MISC' | null,
    quantity: 0,
    notes: ''
  })

  // Group assets by type
  const crypto_assets = assets.filter(a => a.type === 'CRYPTO')
  const stock_assets = assets.filter(a => a.type === 'STOCK')
  const precious_metals_assets = assets.filter(a => a.type === 'GOLD' || a.type === 'SILVER')
  const other_assets = assets.filter(a => !['CRYPTO', 'STOCK', 'GOLD', 'SILVER'].includes(a.type))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatLastUpdated = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const format_symbol_for_tradingview = (symbol: string, asset_type: string): string => {
    switch (asset_type) {
      case 'STOCK':
        // Stocks use symbol as-is
        return symbol
      case 'CRYPTO':
        // Crypto: convert "BTC" to "BINANCE:BTCUSD" or "COINBASE:BTC-USD"
        // Try BINANCE first as it's more common
        if (symbol.includes('/')) {
          // Already formatted like "BTC/USD"
          const [base, quote] = symbol.split('/')
          return `BINANCE:${base}${quote}`
        }
        return `BINANCE:${symbol}USD`
      case 'GOLD':
        return 'TVC:GOLD'
      case 'SILVER':
        return 'TVC:SILVER'
      default:
        return symbol
    }
  }

  const handle_symbol_click = (asset: Asset) => {
    // Only show chart for chartable assets (not CASH or MISC)
    if (asset.type !== 'CASH' && asset.type !== 'MISC') {
      setSelectedChartAsset(asset)
      setChartDialogOpen(true)
    }
  }

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newAsset.type) {
      toast.error('Please select an asset type first')
      return
    }
    
    // Ensure symbol and name are set for non-stock/crypto assets
    if ((newAsset.type === 'CASH' || newAsset.type === 'GOLD' || newAsset.type === 'SILVER' || newAsset.type === 'MISC') && (!newAsset.symbol || !newAsset.name)) {
      toast.error('Symbol and name are required')
      return
    }
    
    try {
      await onAdd({
        symbol: newAsset.symbol,
        name: newAsset.name,
        type: newAsset.type,
        quantity: newAsset.quantity,
        notes: newAsset.notes
      })
      toast.success(`Asset added successfully!`)
      setAddDialogOpen(false)
      setNewAsset({ symbol: '', name: '', type: null, quantity: 0, notes: '' })
    } catch (error) {
      console.error('Error adding asset:', error)
      toast.error('Error adding asset')
    }
  }

  const handleEditAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingAsset) return
    
    try {
      await onEdit(editingAsset)
      toast.success('Asset updated successfully!')
      setEditDialogOpen(false)
      setEditingAsset(null)
    } catch (error) {
      console.error('Error updating asset:', error)
      toast.error('Error updating asset')
    }
  }

  const handleDeleteAsset = async (asset_id: number) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return
    }

    try {
      await onDelete(asset_id)
      toast.success('Asset deleted successfully!')
    } catch (error) {
      console.error('Error deleting asset:', error)
      toast.error('Error deleting asset')
    }
  }

  const openEditDialog = (asset: Asset) => {
    setEditingAsset({ ...asset })
    setEditDialogOpen(true)
  }

  const renderAssetTable = (asset_list: Asset[], title: string) => {
    if (asset_list.length === 0) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{asset_list.length} {asset_list.length === 1 ? 'asset' : 'assets'}</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                  <th className="text-right py-3 px-4 font-medium">Last Updated</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {asset_list.map((asset) => (
                  <tr key={asset.id} className="border-b hover:bg-accent/50">
                    <td 
                      className={`py-3 px-4 font-mono font-medium ${
                        asset.type !== 'CASH' && asset.type !== 'MISC' 
                          ? 'cursor-pointer hover:text-primary hover:underline' 
                          : ''
                      }`}
                      onClick={() => handle_symbol_click(asset)}
                    >
                      {asset.symbol}
                    </td>
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
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(asset.currentPrice)}</td>
                    <td className="py-3 px-4 text-right font-mono font-medium">{formatCurrency(asset.totalValue)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{asset.notes || '-'}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-600">{formatLastUpdated(asset.lastUpdated)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(asset)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Asset</DialogTitle>
                <DialogDescription>
                  Add a new asset to your {portfolio_type === 'personal' ? 'personal' : 'Solo 401k'} portfolio
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAsset} className="space-y-4">
                <div>
                  <Label htmlFor="type">Asset Type *</Label>
                  <Select
                    value={newAsset.type || ''}
                    onValueChange={(value: 'CASH' | 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER' | 'MISC') => {
                      const updated_asset = { ...newAsset, type: value, symbol: '', name: '' }
                      
                      // Auto-populate symbol and name for precious metals and cash
                      if (value === 'GOLD') {
                        updated_asset.symbol = 'GOLD'
                        updated_asset.name = 'Gold'
                      } else if (value === 'SILVER') {
                        updated_asset.symbol = 'SILVER'
                        updated_asset.name = 'Silver'
                      } else if (value === 'CASH') {
                        updated_asset.symbol = 'CASH'
                        updated_asset.name = 'Cash'
                      } else if (value === 'MISC') {
                        updated_asset.symbol = 'MISC'
                        updated_asset.name = 'Miscellaneous'
                      }
                      
                      setNewAsset(updated_asset)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STOCK">Stock</SelectItem>
                      <SelectItem value="CRYPTO">Crypto</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="GOLD">Gold</SelectItem>
                      <SelectItem value="SILVER">Silver</SelectItem>
                      <SelectItem value="MISC">Miscellaneous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newAsset.type === 'STOCK' || newAsset.type === 'CRYPTO') && (
                  <>
                    <div>
                      <Label htmlFor="symbol">Symbol *</Label>
                      <Autocomplete
                        value={newAsset.symbol}
                        onChange={(symbol) => setNewAsset({ ...newAsset, symbol })}
                        onSelect={(option) => setNewAsset({ ...newAsset, symbol: option.symbol, name: option.name })}
                        placeholder={newAsset.type === 'STOCK' ? "e.g., AAPL" : "e.g., BTC"}
                        type={newAsset.type}
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder={newAsset.type === 'STOCK' ? "e.g., Apple Inc." : "e.g., Bitcoin"}
                        required
                      />
                    </div>
                  </>
                )}
                {(newAsset.type === 'CASH' || newAsset.type === 'GOLD' || newAsset.type === 'SILVER' || newAsset.type === 'MISC') && (
                  <>
                    <div>
                      <Label htmlFor="symbol">Symbol *</Label>
                      <Input
                        id="symbol"
                        value={newAsset.symbol}
                        onChange={(e) => setNewAsset({ ...newAsset, symbol: e.target.value.toUpperCase() })}
                        placeholder="e.g., MISC, CASH, GOLD"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newAsset.name}
                        onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                        placeholder="e.g., Miscellaneous, Cash, Gold"
                        required
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="quantity">
                    {newAsset.type === 'CASH' || newAsset.type === 'MISC' ? 'Total Value' : 'Quantity'} 
                    {newAsset.type === 'GOLD' || newAsset.type === 'SILVER' ? ' (ounces)' : 
                     newAsset.type === 'CASH' || newAsset.type === 'MISC' ? ' (dollars)' : ' (shares)'}
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.000001"
                    value={newAsset.quantity || ''}
                    onChange={(e) => setNewAsset({ ...newAsset, quantity: parseFloat(e.target.value) || 0 })}
                    placeholder={
                      newAsset.type === 'GOLD' || newAsset.type === 'SILVER' ? "e.g., 1.5 (ounces)" :
                      newAsset.type === 'CASH' || newAsset.type === 'MISC' ? "e.g., 5000 (total dollars)" :
                      "e.g., 100 (shares)"
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={newAsset.notes}
                    onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                    placeholder="e.g., Bank account, Physical coins, etc."
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Asset
                </Button>
              </form>
            </DialogContent>
          </Dialog>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              {empty_state_icon}
              <h3 className="text-lg font-medium text-gray-900 mb-2 mt-4">{empty_state_title || 'No assets yet'}</h3>
              <p className="text-gray-600 mb-4">{empty_state_description || 'Start by adding your first asset'}</p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Asset
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {renderAssetTable(crypto_assets, 'Crypto Assets')}
          {renderAssetTable(stock_assets, 'Stock Assets')}
          {renderAssetTable(precious_metals_assets, 'Precious Metals')}
          {renderAssetTable(other_assets, 'Other Assets')}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update asset information
            </DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <form onSubmit={handleEditAsset} className="space-y-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={editingAsset.type}
                  onValueChange={(value: 'CASH' | 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER' | 'MISC') => {
                    const updated_asset = { ...editingAsset, type: value }
                    
                    if (value === 'GOLD') {
                      updated_asset.symbol = 'GOLD'
                      updated_asset.name = 'Gold'
                    } else if (value === 'SILVER') {
                      updated_asset.symbol = 'SILVER'
                      updated_asset.name = 'Silver'
                    } else if (value === 'CASH') {
                      updated_asset.symbol = 'CASH'
                      updated_asset.name = 'Cash'
                    } else if (value === 'MISC') {
                      updated_asset.symbol = 'MISC'
                      updated_asset.name = 'Miscellaneous'
                    }
                    
                    setEditingAsset(updated_asset)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STOCK">Stock</SelectItem>
                    <SelectItem value="CRYPTO">Crypto</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="GOLD">Gold</SelectItem>
                    <SelectItem value="SILVER">Silver</SelectItem>
                    <SelectItem value="MISC">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(editingAsset.type === 'STOCK' || editingAsset.type === 'CRYPTO') && (
                <>
                  <div>
                    <Label htmlFor="edit-symbol">Symbol</Label>
                    <Autocomplete
                      value={editingAsset.symbol}
                      onChange={(symbol) => setEditingAsset({ ...editingAsset, symbol })}
                      onSelect={(option) => setEditingAsset({ ...editingAsset, symbol: option.symbol, name: option.name })}
                      placeholder={editingAsset.type === 'STOCK' ? "e.g., AAPL" : "e.g., BTC"}
                      type={editingAsset.type}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingAsset.name}
                      onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              {(editingAsset.type === 'CASH' || editingAsset.type === 'GOLD' || editingAsset.type === 'SILVER' || editingAsset.type === 'MISC') && (
                <>
                  <div>
                    <Label htmlFor="edit-symbol">Symbol</Label>
                    <Input
                      id="edit-symbol"
                      value={editingAsset.symbol}
                      onChange={(e) => setEditingAsset({ ...editingAsset, symbol: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={editingAsset.name}
                      onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="edit-quantity">
                  {editingAsset.type === 'CASH' || editingAsset.type === 'MISC' ? 'Total Value' : 'Quantity'} 
                  {editingAsset.type === 'GOLD' || editingAsset.type === 'SILVER' ? ' (ounces)' : 
                   editingAsset.type === 'CASH' || editingAsset.type === 'MISC' ? ' (dollars)' : ' (shares)'}
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.000001"
                  value={editingAsset.quantity}
                  onChange={(e) => setEditingAsset({ ...editingAsset, quantity: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Input
                  id="edit-notes"
                  value={editingAsset.notes || ''}
                  onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Update Asset
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Chart Dialog */}
      <Dialog open={chartDialogOpen} onOpenChange={setChartDialogOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] !h-[95vh] !max-h-[95vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>
              {selectedChartAsset ? `${selectedChartAsset.name} (${selectedChartAsset.symbol})` : 'Price Chart'}
            </DialogTitle>
          </DialogHeader>
          {selectedChartAsset && (
            <div className="w-full px-6 pb-6 flex-1 overflow-hidden" style={{ height: 'calc(95vh - 80px)' }}>
              <iframe
                key={selectedChartAsset.id}
                src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(format_symbol_for_tradingview(selectedChartAsset.symbol, selectedChartAsset.type))}&interval=D&theme=dark&style=3&locale=en&hide_side_toolbar=false&allow_symbol_change=false&calendar=false`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title={`${selectedChartAsset.symbol} Price Chart`}
                allow="clipboard-write"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

