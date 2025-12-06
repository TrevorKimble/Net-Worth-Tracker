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

interface Solo401kConversion {
  id?: number
  date: string
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
  const [editing_entry, setEditingEntry] = useState<Solo401kConversion | null>(null)
  const [edit_date, setEditDate] = useState<Date | undefined>(undefined)
  const [edit_form_data, setEditFormData] = useState<Omit<Solo401kConversion, 'id' | 'date'>>({
    amount: 0,
    notes: ''
  })
  const [delete_entry_id, setDeleteEntryId] = useState<number | null>(null)
  const [is_edit_dialog_open, setIsEditDialogOpen] = useState(false)
  const [is_delete_dialog_open, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetch_existing_data()
  }, [])

  const fetch_existing_data = async () => {
    try {
      const { getConversionsAction } = await import('@/app/actions/conversions')
      const data = await getConversionsAction()
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
      const { createConversionAction } = await import('@/app/actions/conversions')
      await createConversionAction({
        ...form_data,
        date: selected_date.toISOString()
      })
      toast.success('Conversion saved successfully!')
      fetch_existing_data()
      // Reset form
      setFormData({
        date: '',
        amount: 0,
        notes: ''
      })
      setSelectedDate(undefined)
    } catch (error: any) {
      console.error('Error saving conversion:', error)
      toast.error(error.message || 'Error saving conversion')
    } finally {
      setLoading(false)
    }
  }

  const handle_edit = (entry: Solo401kConversion) => {
    setEditingEntry(entry)
    // Parse MM/DD/YY format to Date object
    const [month, day, year] = entry.date.split('/')
    const entry_date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
    setEditDate(entry_date)
    setEditFormData({
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
      const { updateConversionAction } = await import('@/app/actions/conversions')
      await updateConversionAction({
        id: editing_entry.id,
        ...edit_form_data,
        date: edit_date.toISOString()
      })
      toast.success('Conversion updated successfully!')
      fetch_existing_data()
      setIsEditDialogOpen(false)
      setEditingEntry(null)
      setEditDate(undefined)
    } catch (error: any) {
      console.error('Error updating conversion:', error)
      toast.error(error.message || 'Error updating conversion')
    } finally {
      setLoading(false)
    }
  }

  const handle_delete = async () => {
    if (!delete_entry_id) return

    setLoading(true)

    try {
      const { deleteConversionAction } = await import('@/app/actions/conversions')
      await deleteConversionAction(delete_entry_id)
      toast.success('Conversion deleted successfully!')
      fetch_existing_data()
      setIsDeleteDialogOpen(false)
      setDeleteEntryId(null)
    } catch (error: any) {
      console.error('Error deleting conversion:', error)
      toast.error(error.message || 'Error deleting conversion')
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
                    <th className="text-right p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(existing_data || []).map((entry) => {
                    return (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">{entry.date}</td>
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
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No conversion entries yet
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
              <DialogTitle>Edit Conversion</DialogTitle>
              <DialogDescription>Update the conversion information</DialogDescription>
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
              <DialogTitle>Delete Conversion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this conversion? This action cannot be undone.
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

