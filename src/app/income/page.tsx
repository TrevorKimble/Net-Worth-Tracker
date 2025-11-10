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
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

interface IncomeEntry {
  id?: number
  date: string | Date
  income_source: string
  amount: number
  notes?: string
}

export default function IncomePage() {
  const [form_data, setFormData] = useState<IncomeEntry>({
    date: '',
    income_source: '',
    amount: 0,
    notes: ''
  })
  const [selected_date, setSelectedDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [existing_data, setExistingData] = useState<IncomeEntry[]>([])

  useEffect(() => {
    fetch_existing_data()
  }, [])

  const fetch_existing_data = async () => {
    try {
      const response = await fetch('/api/income')
      if (!response.ok) {
        console.error('Failed to fetch income entries')
        setExistingData([])
        return
      }
      const data = await response.json()
      setExistingData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching income entries:', error)
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
      const response = await fetch('/api/income', {
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
        toast.success('Income entry saved successfully!')
        fetch_existing_data()
        // Reset form
        setFormData({
          date: '',
          income_source: '',
          amount: 0,
          notes: ''
        })
        setSelectedDate(undefined)
      } else {
        toast.error('Failed to save income entry')
      }
    } catch (error) {
      console.error('Error saving income entry:', error)
      toast.error('Error saving income entry')
    } finally {
      setLoading(false)
    }
  }

  const income_sources = ['LDC', 'Ebay', '3D2A Supplies']

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Income</h1>
          <p className="text-muted-foreground mt-2">Track your income sources</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Income Entry</CardTitle>
                <CardDescription>Enter your income information</CardDescription>
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

                  {/* Income Source */}
                  <div>
                    <Label htmlFor="income_source">Income Source</Label>
                    <Select
                      value={form_data.income_source}
                      onValueChange={(value) => setFormData({ ...form_data, income_source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select income source" />
                      </SelectTrigger>
                      <SelectContent>
                        {income_sources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    {loading ? 'Saving...' : 'Save Income Entry'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Total Income</CardTitle>
                <CardDescription>Sum of all entries</CardDescription>
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
            <CardTitle>Income Entries</CardTitle>
            <CardDescription>All income entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Income Source</th>
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
                        <td className="p-2">{entry.income_source}</td>
                        <td className="p-2">${entry.amount.toLocaleString()}</td>
                        <td className="p-2 text-muted-foreground">{entry.notes || '-'}</td>
                      </tr>
                    )
                  })}
                  {(!existing_data || existing_data.length === 0) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No income entries yet
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

