'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { toast } from "sonner"

interface MonthlyInput {
  id?: number
  month: number
  year: number
  cash: number
  stocks: number
  crypto: number
  gold: number
  silver: number
  misc: number
  notes?: string | null
}

export default function MonthlyInputPage() {
  const [formData, setFormData] = useState<MonthlyInput>({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    cash: 0,
    stocks: 0,
    crypto: 0,
    gold: 0,
    silver: 0,
    misc: 0,
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [existingData, setExistingData] = useState<MonthlyInput[]>([])

  useEffect(() => {
    fetchExistingData()
  }, [])

  const fetchExistingData = async () => {
    try {
      const { getMonthlyInputs } = await import('@/services/monthly-inputs')
      const data = await getMonthlyInputs()
      setExistingData(data)
    } catch (error) {
      console.error('Error fetching monthly inputs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { 
        createMonthlyInput, 
        updateMonthlyInput, 
        getMonthlyInputByMonthYear 
      } = await import('@/services/monthly-inputs')
      
      // Check if a record exists for this month/year
      const existing_input = await getMonthlyInputByMonthYear(formData.month, formData.year)
      
      if (existing_input) {
        // Update existing record
        await updateMonthlyInput(formData)
        toast.success('Monthly input updated successfully!')
      } else {
        // Create new record
        await createMonthlyInput(formData)
        toast.success('Monthly input saved successfully!')
      }
      
      fetchExistingData()
      // Reset form
      setFormData({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        cash: 0,
        stocks: 0,
        crypto: 0,
        gold: 0,
        silver: 0,
        misc: 0,
        notes: ''
      })
    } catch (error: unknown) {
      console.error('Error saving monthly input:', error)
      const error_message = error instanceof Error ? error.message : 'Error saving monthly input'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const getTotalValue = () => {
    return formData.cash + formData.stocks + formData.crypto + formData.gold + formData.silver + formData.misc
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Monthly Input</h1>
          <p className="text-muted-foreground mt-2">Quick monthly estimates for your assets</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Monthly Estimate</CardTitle>
                <CardDescription>Enter your estimated values for this month</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Month and Year */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month">Month</Label>
                      <Select
                        value={formData.month.toString()}
                        onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month, index) => (
                            <SelectItem key={index} value={(index + 1).toString()}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>

                  {/* Asset Values */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cash">Cash ($)</Label>
                      <Input
                        id="cash"
                        type="number"
                        step="0.01"
                        value={formData.cash}
                        onChange={(e) => setFormData({ ...formData, cash: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stocks">Stocks ($)</Label>
                      <Input
                        id="stocks"
                        type="number"
                        step="0.01"
                        value={formData.stocks}
                        onChange={(e) => setFormData({ ...formData, stocks: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="crypto">Crypto ($)</Label>
                      <Input
                        id="crypto"
                        type="number"
                        step="0.01"
                        value={formData.crypto}
                        onChange={(e) => setFormData({ ...formData, crypto: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gold">Gold ($)</Label>
                      <Input
                        id="gold"
                        type="number"
                        step="0.01"
                        value={formData.gold}
                        onChange={(e) => setFormData({ ...formData, gold: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="silver">Silver ($)</Label>
                      <Input
                        id="silver"
                        type="number"
                        step="0.01"
                        value={formData.silver}
                        onChange={(e) => setFormData({ ...formData, silver: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="misc">Miscellaneous ($)</Label>
                      <Input
                        id="misc"
                        type="number"
                        step="0.01"
                        value={formData.misc}
                        onChange={(e) => setFormData({ ...formData, misc: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                      placeholder="Any additional notes for this month..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Monthly Input'}
                  </Button>
                </form>

                {/* Previous Data Table */}
                {existingData.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">Previous Monthly Inputs</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 text-sm font-medium text-muted-foreground">Month</th>
                            <th className="text-left p-2 text-sm font-medium text-muted-foreground">Year</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Cash</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Stocks</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Crypto</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Gold</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Silver</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Misc</th>
                            <th className="text-right p-2 text-sm font-medium text-muted-foreground">Total</th>
                            <th className="text-left p-2 text-sm font-medium text-muted-foreground">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {existingData.map((entry) => {
                            const total_value = entry.cash + entry.stocks + entry.crypto + entry.gold + entry.silver + entry.misc
                            return (
                              <tr key={entry.id} className="border-b hover:bg-muted/50">
                                <td className="p-2 text-sm">{months[entry.month - 1]}</td>
                                <td className="p-2 text-sm">{entry.year}</td>
                                <td className="p-2 text-sm text-right">${entry.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-right">${entry.stocks.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-right">${entry.crypto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-right">${entry.gold.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-right">${entry.silver.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-right">${entry.misc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-right font-medium">${total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="p-2 text-sm text-muted-foreground">{entry.notes || '-'}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>Total estimated value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash:</span>
                    <span className="font-medium">${formData.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stocks:</span>
                    <span className="font-medium">${formData.stocks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Crypto:</span>
                    <span className="font-medium">${formData.crypto.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Gold:</span>
                    <span className="font-medium">${formData.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Silver:</span>
                    <span className="font-medium">${formData.silver.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Misc:</span>
                    <span className="font-medium">${formData.misc.toLocaleString()}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${getTotalValue().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your latest monthly inputs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {existingData.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{months[entry.month - 1]} {entry.year}</div>
                        <div className="text-sm text-muted-foreground">
                          ${(entry.cash + entry.stocks + entry.crypto + entry.gold + entry.silver + entry.misc).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {existingData.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No entries yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

