'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TextAutocomplete } from "@/components/ui/text-autocomplete"

interface IncomeEntry {
  id?: number
  date: string
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
  const [editing_entry, setEditingEntry] = useState<IncomeEntry | null>(null)
  const [edit_date, setEditDate] = useState<Date | undefined>(undefined)
  const [edit_form_data, setEditFormData] = useState<Omit<IncomeEntry, 'id' | 'date'>>({
    income_source: '',
    amount: 0,
    notes: ''
  })
  const [delete_entry_id, setDeleteEntryId] = useState<number | null>(null)
  const [is_edit_dialog_open, setIsEditDialogOpen] = useState(false)
  const [is_delete_dialog_open, setIsDeleteDialogOpen] = useState(false)
  const [unique_income_sources, setUniqueIncomeSources] = useState<string[]>([])

  useEffect(() => {
    fetch_existing_data()
    fetch_unique_income_sources()
  }, [])

  const fetch_unique_income_sources = async () => {
    try {
      const { getUniqueIncomeSources } = await import('@/services/income')
      const sources = await getUniqueIncomeSources()
      setUniqueIncomeSources(sources)
    } catch (error) {
      console.error('Error fetching unique income sources:', error)
      setUniqueIncomeSources([])
    }
  }

  const fetch_existing_data = async () => {
    try {
      const { getIncomeEntries } = await import('@/services/income')
      const data = await getIncomeEntries()
      // Convert null notes to undefined for component compatibility
      const formatted_data = (Array.isArray(data) ? data : []).map(entry => ({
        ...entry,
        notes: entry.notes ?? undefined
      }))
      setExistingData(formatted_data)
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
      const { createIncomeEntry } = await import('@/services/income')
      await createIncomeEntry({
        ...form_data,
        date: selected_date.toISOString()
      })
      toast.success('Income entry saved successfully!')
      fetch_existing_data()
      fetch_unique_income_sources()
      // Reset form
      setFormData({
        date: '',
        income_source: '',
        amount: 0,
        notes: ''
      })
      setSelectedDate(undefined)
    } catch (error) {
      console.error('Error saving income entry:', error)
      const error_message = error instanceof Error ? error.message : 'Error saving income entry'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_edit = (entry: IncomeEntry) => {
    setEditingEntry(entry)
    // Parse MM/DD/YY format to Date object
    const [month, day, year] = entry.date.split('/')
    const entry_date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
    setEditDate(entry_date)
    setEditFormData({
      income_source: entry.income_source,
      amount: entry.amount,
      notes: entry.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const handle_update = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editing_entry?.id || !edit_date) {
      toast.error('Please select a date')
      return
    }
    
    setLoading(true)

    try {
      const { updateIncomeEntry } = await import('@/services/income')
      await updateIncomeEntry({
        id: editing_entry.id,
        ...edit_form_data,
        date: edit_date.toISOString()
      })
      toast.success('Income entry updated successfully!')
      fetch_existing_data()
      fetch_unique_income_sources()
      setIsEditDialogOpen(false)
      setEditingEntry(null)
      setEditDate(undefined)
    } catch (error) {
      console.error('Error updating income entry:', error)
      const error_message = error instanceof Error ? error.message : 'Error updating income entry'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_delete = async () => {
    if (!delete_entry_id) return

    setLoading(true)

    try {
      const { deleteIncomeEntry } = await import('@/services/income')
      await deleteIncomeEntry(delete_entry_id)
      toast.success('Income entry deleted successfully!')
      fetch_existing_data()
      fetch_unique_income_sources()
      setIsDeleteDialogOpen(false)
      setDeleteEntryId(null)
    } catch (error) {
      console.error('Error deleting income entry:', error)
      const error_message = error instanceof Error ? error.message : 'Error deleting income entry'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

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
                    <TextAutocomplete
                      id="income_source"
                      value={form_data.income_source}
                      onChange={(value) => setFormData({ ...form_data, income_source: value })}
                      options={unique_income_sources}
                      placeholder="Enter or select income source"
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
                    <th className="text-right p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(existing_data || []).map((entry) => {
                    return (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">{entry.date}</td>
                        <td className="p-2">{entry.income_source}</td>
                        <td className="p-2">${entry.amount.toLocaleString()}</td>
                        <td className="p-2 text-muted-foreground">{entry.notes || '-'}</td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handle_edit(entry)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteEntryId(entry.id || null)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {(!existing_data || existing_data.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No income entries yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={is_edit_dialog_open} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income Entry</DialogTitle>
              <DialogDescription>Update the income entry information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handle_update} className="space-y-4">
              <div>
                <Label htmlFor="edit_date">Date</Label>
                <DatePicker
                  date={edit_date}
                  onDateChange={setEditDate}
                  placeholder="Pick a date"
                />
              </div>
              <div>
                <Label htmlFor="edit_income_source">Income Source</Label>
                <TextAutocomplete
                  id="edit_income_source"
                  value={edit_form_data.income_source}
                  onChange={(value) => setEditFormData({ ...edit_form_data, income_source: value })}
                  options={unique_income_sources}
                  placeholder="Enter or select income source"
                />
              </div>
              <div>
                <Label htmlFor="edit_amount">Amount ($)</Label>
                <Input
                  id="edit_amount"
                  type="number"
                  step="0.01"
                  value={edit_form_data.amount}
                  onChange={(e) => setEditFormData({ ...edit_form_data, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit_notes">Notes (Optional)</Label>
                <Input
                  id="edit_notes"
                  value={edit_form_data.notes}
                  onChange={(e) => setEditFormData({ ...edit_form_data, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={is_delete_dialog_open} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Income Entry</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this income entry? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={handle_delete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

