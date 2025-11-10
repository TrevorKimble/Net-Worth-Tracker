'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

interface Solo401kConversion {
  id?: number
  date: string | Date
  amount: number
  notes?: string
}

export default function ConversionsPage() {
  const [form_data, setFormData] = useState<Solo401kConversion>({
    date: '',
    amount: 0,
    notes: ''
  })
  const [selected_date, setSelectedDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [existing_data, setExistingData] = useState<Solo401kConversion[]>([])

  useEffect(() => {
    fetch_existing_data()
  }, [])

  const fetch_existing_data = async () => {
    try {
      const response = await fetch('/api/conversions')
      if (!response.ok) {
        console.error('Failed to fetch conversions')
        setExistingData([])
        return
      }
      const data = await response.json()
      setExistingData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching conversions:', error)
      setExistingData([])
    }
  }

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selected_date) {
      toast.error('Please select a date')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('/api/conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form_data,
          date: selected_date.toISOString()
        }),
      })

      if (response.ok) {
        toast.success('Conversion saved successfully!')
        fetch_existing_data()
        // Reset form
        setFormData({
          date: '',
          amount: 0,
          notes: ''
        })
        setSelectedDate(undefined)
      } else {
        toast.error('Failed to save conversion')
      }
    } catch (error) {
      console.error('Error saving conversion:', error)
      toast.error('Error saving conversion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Solo 401k Conversions</h1>
          <p className="text-muted-foreground mt-2">Track your Solo 401k conversions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Conversion</CardTitle>
                <CardDescription>Enter your conversion information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handle_submit} className="space-y-6">
                  {/* Date */}
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <DatePicker
                      date={selected_date}
                      onDateChange={setSelectedDate}
                      placeholder="Pick a date"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={form_data.amount}
                      onChange={(e) => setFormData({ ...form_data, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={form_data.notes}
                      onChange={(e) => setFormData({ ...form_data, notes: e.target.value })}
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Conversion'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Total Conversions</CardTitle>
                <CardDescription>Sum of all conversions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  ${(existing_data || []).reduce((sum, entry) => sum + entry.amount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Entries</CardTitle>
            <CardDescription>All conversion entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Amount</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {(existing_data || []).map((entry) => {
                    const entry_date = entry.date instanceof Date ? entry.date : new Date(entry.date)
                    return (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">{format(entry_date, 'MM/dd/yyyy')}</td>
                        <td className="p-2">${entry.amount.toLocaleString()}</td>
                        <td className="p-2 text-muted-foreground">{entry.notes || '-'}</td>
                      </tr>
                    )
                  })}
                  {(!existing_data || existing_data.length === 0) && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        No conversion entries yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

