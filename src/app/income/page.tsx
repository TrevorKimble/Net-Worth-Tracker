'use client'

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TextAutocomplete } from "@/components/ui/text-autocomplete"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts'

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
  const [is_add_dialog_open, setIsAddDialogOpen] = useState(false)
  const [is_edit_dialog_open, setIsEditDialogOpen] = useState(false)
  const [is_delete_dialog_open, setIsDeleteDialogOpen] = useState(false)
  const [unique_income_sources, setUniqueIncomeSources] = useState<string[]>([])
  const [selected_year, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [current_page, setCurrentPage] = useState(1)
  const [page_size, setPageSize] = useState(10)

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
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error saving income entry:', error)
      const error_message = error instanceof Error ? error.message : 'Error saving income entry'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_add_dialog_close = () => {
    setIsAddDialogOpen(false)
    // Reset form when closing
    setFormData({
      date: '',
      income_source: '',
      amount: 0,
      notes: ''
    })
    setSelectedDate(undefined)
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

  // Parse date from MM/DD/YY format
  const parse_date = (date_string: string): { month: number; year: number } => {
    const [month, , year] = date_string.split('/')
    const full_year = 2000 + parseInt(year)
    return { month: parseInt(month), year: full_year }
  }

  // Filter entries by selected year
  const filtered_by_year = useMemo(() => {
    return (existing_data || []).filter(entry => {
      const { year } = parse_date(entry.date)
      return year === selected_year
    })
  }, [existing_data, selected_year])

  // Calculate monthly totals for chart
  const monthly_data = useMemo(() => {
    const month_totals: Record<number, number> = {}
    
    // Initialize all months to 0
    for (let i = 1; i <= 12; i++) {
      month_totals[i] = 0
    }
    
    // Sum amounts by month
    filtered_by_year.forEach(entry => {
      const { month } = parse_date(entry.date)
      month_totals[month] = (month_totals[month] || 0) + entry.amount
    })
    
    // Convert to array format for chart
    const month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return month_names.map((name, index) => ({
      month: name,
      amount: month_totals[index + 1] || 0
    }))
  }, [filtered_by_year])

  // Calculate total for selected year
  const year_total = useMemo(() => {
    return filtered_by_year.reduce((sum, entry) => sum + entry.amount, 0)
  }, [filtered_by_year])

  // Paginate filtered entries
  const paginated_entries = useMemo(() => {
    const start_index = (current_page - 1) * page_size
    const end_index = start_index + page_size
    return filtered_by_year.slice(start_index, end_index)
  }, [filtered_by_year, current_page, page_size])

  const total_pages = Math.ceil(filtered_by_year.length / page_size)

  const handle_year_change = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedYear(prev => prev + 1)
    }
    setCurrentPage(1) // Reset to first page when changing year
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Income</h1>
            <p className="text-muted-foreground mt-2">Track your income sources</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Income Entry
          </Button>
        </div>

        {/* Total Income Card */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Total Income ({selected_year})</CardTitle>
            <CardDescription>Sum of all entries for the selected year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${year_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Income</CardTitle>
                <CardDescription>Income breakdown by month for {selected_year}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handle_year_change('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold min-w-[80px] text-center">
                  {selected_year}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handle_year_change('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {monthly_data.some(d => d.amount > 0) ? (
              <div className="outline-none [&_svg]:outline-none [&_svg]:focus:outline-none" style={{ outline: 'none' }} tabIndex={-1}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={monthly_data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={true} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#ffffff"
                    tick={{ fill: '#ffffff', fontSize: 12 }}
                    tickLine={{ stroke: '#ffffff' }}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#ffffff"
                    tick={{ fill: '#ffffff', fontSize: 12 }}
                    tickLine={{ stroke: '#ffffff' }}
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
                      return `$${value}`
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="url(#gradientIncome)"
                    radius={[8, 8, 0, 0]}
                  >
                    <LabelList 
                      dataKey="amount" 
                      position="top"
                      fill="#ffffff"
                      fontSize={12}
                      formatter={(value: unknown) => {
                        const num_value = typeof value === 'number' ? value : typeof value === 'string' ? parseFloat(value) || 0 : 0
                        return new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }).format(num_value)
                      }}
                    />
                  </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                No income data available for {selected_year}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Income Entries ({selected_year})</CardTitle>
            <CardDescription>All income entries for the selected year</CardDescription>
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
                  {paginated_entries.map((entry) => {
                    return (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">{entry.date}</td>
                        <td className="p-2">{entry.income_source}</td>
                        <td className="p-2">${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                  {paginated_entries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No income entries for {selected_year}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {filtered_by_year.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {((current_page - 1) * page_size) + 1} to {Math.min(current_page * page_size, filtered_by_year.length)} of {filtered_by_year.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Select value={page_size.toString()} onValueChange={(value) => {
                    setPageSize(parseInt(value, 10))
                    setCurrentPage(1)
                  }}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                      <SelectItem value="100">100 per page</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={current_page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground min-w-[100px] text-center">
                    Page {current_page} of {total_pages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(total_pages, prev + 1))}
                    disabled={current_page >= total_pages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Income Entry Dialog */}
        <Dialog open={is_add_dialog_open} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Income Entry</DialogTitle>
              <DialogDescription>Enter your income information below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handle_submit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold">Date *</Label>
                  <DatePicker
                    date={selected_date}
                    onDateChange={setSelectedDate}
                    placeholder="Pick a date"
                  />
                </div>

                {/* Income Source */}
                <div className="space-y-2">
                  <Label htmlFor="income_source" className="text-sm font-semibold">Income Source *</Label>
                  <TextAutocomplete
                    id="income_source"
                    value={form_data.income_source}
                    onChange={(value) => setFormData({ ...form_data, income_source: value })}
                    options={unique_income_sources}
                    placeholder="Enter or select income source"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-semibold">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={form_data.amount || ''}
                    onChange={(e) => setFormData({ ...form_data, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="h-10"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-semibold">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={form_data.notes || ''}
                    onChange={(e) => setFormData({ ...form_data, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    className="h-10"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handle_add_dialog_close} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Income Entry'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={is_edit_dialog_open} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Income Entry</DialogTitle>
              <DialogDescription>Update the income entry information below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handle_update} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="edit_date" className="text-sm font-semibold">Date *</Label>
                  <DatePicker
                    date={edit_date}
                    onDateChange={setEditDate}
                    placeholder="Pick a date"
                  />
                </div>

                {/* Income Source */}
                <div className="space-y-2">
                  <Label htmlFor="edit_income_source" className="text-sm font-semibold">Income Source *</Label>
                  <TextAutocomplete
                    id="edit_income_source"
                    value={edit_form_data.income_source}
                    onChange={(value) => setEditFormData({ ...edit_form_data, income_source: value })}
                    options={unique_income_sources}
                    placeholder="Enter or select income source"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="edit_amount" className="text-sm font-semibold">Amount ($) *</Label>
                  <Input
                    id="edit_amount"
                    type="number"
                    step="0.01"
                    value={edit_form_data.amount || ''}
                    onChange={(e) => setEditFormData({ ...edit_form_data, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="h-10"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="edit_notes" className="text-sm font-semibold">Notes (Optional)</Label>
                  <Input
                    id="edit_notes"
                    value={edit_form_data.notes || ''}
                    onChange={(e) => setEditFormData({ ...edit_form_data, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    className="h-10"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Updating...' : 'Update Income Entry'}
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

