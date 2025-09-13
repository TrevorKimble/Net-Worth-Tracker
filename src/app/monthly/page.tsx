'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface MonthlyInput {
  id?: string
  month: number
  year: number
  cash: number
  stocks: number
  crypto: number
  gold: number
  silver: number
  misc: number
  notes?: string
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
      const response = await fetch('/api/monthly-inputs')
      const data = await response.json()
      setExistingData(data)
    } catch (error) {
      console.error('Error fetching monthly inputs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/monthly-inputs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Monthly input saved successfully!')
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
      } else {
        toast.error('Failed to save monthly input')
      }
    } catch (error) {
      console.error('Error saving monthly input:', error)
      toast.error('Error saving monthly input')
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            Monthly Input
          </h1>
          <p className="text-gray-600 mt-2">Quick monthly estimates for your assets</p>
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
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional notes for this month..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Monthly Input'}
                  </Button>
                </form>
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
                    <span className="text-sm text-gray-600">Cash:</span>
                    <span className="font-medium">${formData.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stocks:</span>
                    <span className="font-medium">${formData.stocks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Crypto:</span>
                    <span className="font-medium">${formData.crypto.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Gold:</span>
                    <span className="font-medium">${formData.gold.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Silver:</span>
                    <span className="font-medium">${formData.silver.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Misc:</span>
                    <span className="font-medium">${formData.misc.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${getTotalValue().toLocaleString()}</span>
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
                    <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{months[entry.month - 1]} {entry.year}</div>
                        <div className="text-sm text-gray-600">
                          ${(entry.cash + entry.stocks + entry.crypto + entry.gold + entry.silver + entry.misc).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {existingData.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No entries yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

