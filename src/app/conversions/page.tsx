'use client'

import { useState, useEffect, useMemo } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface Solo401kConversion {
  id?: number
  date: string
  amount: number
  is_employer_contribution?: boolean
  is_employee_contribution?: boolean
  notes?: string
}

interface IncomeEntry {
  id: number
  date: string
  income_source: string
  amount: number
  notes: string | null
  is_self_employment_income: boolean
  createdAt: string
  updatedAt: string
}

// Contribution limits for 2026 (can be made configurable per year)
const CONTRIBUTION_LIMITS_2026 = {
  employee_base: 24500,
  employee_catchup_50: 8000,
  employee_super_catchup_60_63: 11250,
  employer_percentage: 0.20,
  employer_compensation_cap: 360000,
  total_combined_limit: 72000
}

function get_contribution_limits() {
  // For now, use 2026 limits. Can be expanded to support different years
  return CONTRIBUTION_LIMITS_2026
}

export default function ConversionsPage() {
  const [form_data, setFormData] = useState<Solo401kConversion>({
    date: '',
    amount: 0,
    is_employer_contribution: false,
    is_employee_contribution: false,
    notes: ''
  })
  const [selected_date, setSelectedDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [existing_data, setExistingData] = useState<Solo401kConversion[]>([])
  const [income_data, setIncomeData] = useState<IncomeEntry[]>([])
  const [editing_entry, setEditingEntry] = useState<Solo401kConversion | null>(null)
  const [edit_date, setEditDate] = useState<Date | undefined>(undefined)
  const [edit_form_data, setEditFormData] = useState<Omit<Solo401kConversion, 'id' | 'date'>>({
    amount: 0,
    is_employer_contribution: false,
    is_employee_contribution: false,
    notes: ''
  })
  const [delete_entry_id, setDeleteEntryId] = useState<number | null>(null)
  const [is_add_dialog_open, setIsAddDialogOpen] = useState(false)
  const [is_edit_dialog_open, setIsEditDialogOpen] = useState(false)
  const [is_delete_dialog_open, setIsDeleteDialogOpen] = useState(false)
  const [selected_year, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    fetch_existing_data()
    fetch_income_data()
  }, [])

  const fetch_existing_data = async () => {
    try {
      const { getConversions } = await import('@/services/conversions')
      const data = await getConversions()
      setExistingData(data as Solo401kConversion[])
    } catch (error) {
      console.error('Error fetching conversions:', error)
      setExistingData([])
    }
  }

  const fetch_income_data = async () => {
    try {
      const { getIncomeEntries } = await import('@/services/income')
      const data = await getIncomeEntries()
      setIncomeData(data as IncomeEntry[])
    } catch (error) {
      console.error('Error fetching income data:', error)
      setIncomeData([])
    }
  }

  // Parse date from MM/DD/YY format
  const parse_date = (date_string: string): { month: number; year: number } => {
    const [month, , year] = date_string.split('/')
    const full_year = 2000 + parseInt(year)
    return { month: parseInt(month), year: full_year }
  }

  // Filter conversions by selected year
  const filtered_conversions_by_year = useMemo(() => {
    return (existing_data || []).filter(entry => {
      const { year } = parse_date(entry.date)
      return year === selected_year
    })
  }, [existing_data, selected_year])

  // Filter income by selected year and self-employment
  const filtered_income_by_year = useMemo(() => {
    return (income_data || []).filter(entry => {
      const { year } = parse_date(entry.date)
      return year === selected_year && entry.is_self_employment_income === true
    })
  }, [income_data, selected_year])

  // Calculate total self-employment income for the year
  const total_self_employment_income = useMemo(() => {
    return filtered_income_by_year.reduce((sum, entry) => sum + entry.amount, 0)
  }, [filtered_income_by_year])

  // Calculate contribution totals for the year
  const employer_contributions_total = useMemo(() => {
    return filtered_conversions_by_year
      .filter(e => e.is_employer_contribution)
      .reduce((sum, entry) => sum + entry.amount, 0)
  }, [filtered_conversions_by_year])

  const employee_contributions_total = useMemo(() => {
    return filtered_conversions_by_year
      .filter(e => e.is_employee_contribution)
      .reduce((sum, entry) => sum + entry.amount, 0)
  }, [filtered_conversions_by_year])

  // Calculate contribution limits
  const limits = useMemo(() => {
    const year_limits = get_contribution_limits()
    const net_earnings = total_self_employment_income
    
    // Employee limit: base $24,500 or 100% of compensation, whichever is less
    const employee_limit = Math.min(year_limits.employee_base, net_earnings)
    
    // Employer limit: 20% of net self-employment earnings, capped at $360,000 compensation
    const compensation_for_employer = Math.min(net_earnings, year_limits.employer_compensation_cap)
    const employer_limit = compensation_for_employer * year_limits.employer_percentage
    
    // Total combined limit: $72,000
    const total_limit = year_limits.total_combined_limit
    
    return {
      employee_limit,
      employer_limit,
      total_limit,
      net_earnings
    }
  }, [total_self_employment_income])

  // Calculate totals for display
  const total_contributions = employer_contributions_total + employee_contributions_total
  const employee_remaining = Math.max(0, limits.employee_limit - employee_contributions_total)
  const employer_remaining = Math.max(0, limits.employer_limit - employer_contributions_total)
  const total_remaining = Math.max(0, limits.total_limit - total_contributions)
  
  // Voluntary After Tax limit: $72,000 - (max employee + max employer)
  const voluntary_after_tax_limit = 72000 - (limits.employee_limit + limits.employer_limit)
  const voluntary_after_tax_contributed = 0 // No data for now
  const voluntary_after_tax_remaining = voluntary_after_tax_limit - voluntary_after_tax_contributed

  const handle_submit = async () => {
    if (!selected_date) {
      toast.error('Please select a date')
      return
    }
    
    setLoading(true)

    try {
      const { createConversion } = await import('@/services/conversions')
      await createConversion({
        ...form_data,
        date: selected_date.toISOString()
      })
      toast.success('Contribution saved successfully!')
      fetch_existing_data()
      // Reset form
      setFormData({
        date: '',
        amount: 0,
        is_employer_contribution: false,
        is_employee_contribution: false,
        notes: ''
      })
      setSelectedDate(undefined)
      setIsAddDialogOpen(false)
    } catch (error: unknown) {
      const error_message = error instanceof Error ? error.message : 'Error saving contribution'
      console.error('Error saving contribution:', error_message)
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_add_dialog_close = () => {
    setIsAddDialogOpen(false)
    setFormData({
      date: '',
      amount: 0,
      is_employer_contribution: false,
      is_employee_contribution: false,
      notes: ''
    })
    setSelectedDate(undefined)
  }

  const handle_edit = (entry: Solo401kConversion) => {
    setEditingEntry(entry)
    const [month, day, year] = entry.date.split('/')
    const entry_date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
    setEditDate(entry_date)
    setEditFormData({
      amount: entry.amount,
      is_employer_contribution: entry.is_employer_contribution || false,
      is_employee_contribution: entry.is_employee_contribution || false,
      notes: entry.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const handle_update = async () => {
    if (!editing_entry?.id || !edit_date) {
      toast.error('Please select a date')
      return
    }
    
    setLoading(true)

    try {
      const { updateConversion } = await import('@/services/conversions')
      await updateConversion({
        id: editing_entry.id,
        ...edit_form_data,
        date: edit_date.toISOString()
      })
      toast.success('Contribution updated successfully!')
      fetch_existing_data()
      setIsEditDialogOpen(false)
      setEditingEntry(null)
      setEditDate(undefined)
    } catch (error: unknown) {
      const error_message = error instanceof Error ? error.message : 'Error updating contribution'
      console.error('Error updating contribution:', error_message)
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_delete = async () => {
    if (!delete_entry_id) return

    setLoading(true)

    try {
      const { deleteConversion } = await import('@/services/conversions')
      await deleteConversion(delete_entry_id)
      toast.success('Contribution deleted successfully!')
      fetch_existing_data()
      setIsDeleteDialogOpen(false)
      setDeleteEntryId(null)
    } catch (error: unknown) {
      const error_message = error instanceof Error ? error.message : 'Error deleting contribution'
      console.error('Error deleting contribution:', error_message)
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_year_change = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedYear(prev => prev + 1)
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Solo 401k Contributions</h1>
            <p className="text-muted-foreground mt-2">Track your Solo 401k contributions and limits</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Contribution
          </Button>
        </div>

        {/* Year Selection with Self-Employment Income */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Self-Employment Income ({selected_year})</CardTitle>
                <CardDescription className="text-2xl font-bold text-primary mt-2">
                  ${total_self_employment_income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardDescription>
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
        </Card>

        {/* Contribution Limits Sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Max Combined */}
          <Card>
            <CardHeader>
              <CardTitle>Max Combined</CardTitle>
              <CardDescription>Total combined limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ${limits.total_limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contributed</span>
                  <span className="font-medium">${total_contributions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-6 overflow-hidden relative">
                  <div 
                    className="h-full bg-green-500 transition-all absolute left-0 top-0"
                    style={{ width: `${Math.min(100, (total_contributions / limits.total_limit) * 100)}%` }}
                  />
                  {total_remaining > 0 && (
                    <div 
                      className="h-full bg-red-500 transition-all absolute top-0"
                      style={{ 
                        width: `${(total_remaining / limits.total_limit) * 100}%`, 
                        left: `${(total_contributions / limits.total_limit) * 100}%` 
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">${total_remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Max Employee */}
          <Card>
            <CardHeader>
              <CardTitle>Max Employee</CardTitle>
              <CardDescription>Employee contribution limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ${limits.employee_limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contributed</span>
                  <span className="font-medium">${employee_contributions_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-6 overflow-hidden relative">
                  <div 
                    className="h-full bg-green-500 transition-all absolute left-0 top-0"
                    style={{ width: `${limits.employee_limit > 0 ? Math.min(100, (employee_contributions_total / limits.employee_limit) * 100) : 0}%` }}
                  />
                  {employee_remaining > 0 && (
                    <div 
                      className="h-full bg-red-500 transition-all absolute top-0"
                      style={{ 
                        width: `${(employee_remaining / limits.employee_limit) * 100}%`, 
                        left: `${limits.employee_limit > 0 ? (employee_contributions_total / limits.employee_limit) * 100 : 0}%` 
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">${employee_remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Max Employer */}
          <Card>
            <CardHeader>
              <CardTitle>Max Employer</CardTitle>
              <CardDescription>Employer contribution limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ${limits.employer_limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contributed</span>
                  <span className="font-medium">${employer_contributions_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-6 overflow-hidden relative">
                  <div 
                    className="h-full bg-green-500 transition-all absolute left-0 top-0"
                    style={{ width: `${limits.employer_limit > 0 ? Math.min(100, (employer_contributions_total / limits.employer_limit) * 100) : 0}%` }}
                  />
                  {employer_remaining > 0 && (
                    <div 
                      className="h-full bg-red-500 transition-all absolute top-0"
                      style={{ 
                        width: `${(employer_remaining / limits.employer_limit) * 100}%`, 
                        left: `${limits.employer_limit > 0 ? (employer_contributions_total / limits.employer_limit) * 100 : 0}%` 
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">${employer_remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Voluntary After Tax */}
          <Card>
            <CardHeader>
              <CardTitle>Voluntary After Tax</CardTitle>
              <CardDescription>After-tax contribution limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ${voluntary_after_tax_limit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contributed</span>
                  <span className="font-medium">${voluntary_after_tax_contributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-6 overflow-hidden relative">
                  <div 
                    className="h-full bg-green-500 transition-all absolute left-0 top-0"
                    style={{ width: `${voluntary_after_tax_limit > 0 ? Math.min(100, (voluntary_after_tax_contributed / voluntary_after_tax_limit) * 100) : 0}%` }}
                  />
                  {voluntary_after_tax_remaining > 0 && (
                    <div 
                      className="h-full bg-red-500 transition-all absolute top-0"
                      style={{ 
                        width: `${(voluntary_after_tax_remaining / voluntary_after_tax_limit) * 100}%`, 
                        left: `${voluntary_after_tax_limit > 0 ? (voluntary_after_tax_contributed / voluntary_after_tax_limit) * 100 : 0}%` 
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium">${voluntary_after_tax_remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contribution Entries ({selected_year})</CardTitle>
            <CardDescription>All contribution entries for the selected year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Amount</th>
                    <th className="text-left p-2 font-medium">Type</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                    <th className="text-right p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered_conversions_by_year.map((entry) => {
                    const contribution_type = entry.is_employer_contribution ? 'Employer' : entry.is_employee_contribution ? 'Employee' : 'None'
                    return (
                      <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2">{entry.date}</td>
                        <td className="p-2">${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-2">{contribution_type}</td>
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
                  {filtered_conversions_by_year.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No contribution entries for {selected_year}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Contribution Dialog */}
        <Dialog open={is_add_dialog_open} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Add New Contribution</DialogTitle>
              <DialogDescription>Enter your contribution information below</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handle_submit(); }} className="space-y-5">
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
            </div>

            {/* Contribution Type Switches */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Contribution Type *</Label>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Label htmlFor="employer_contribution" className="text-sm font-medium cursor-pointer">
                    Employer Contribution
                  </Label>
                  <Switch
                    id="employer_contribution"
                    checked={form_data.is_employer_contribution || false}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...form_data,
                        is_employer_contribution: checked,
                        is_employee_contribution: checked ? false : form_data.is_employee_contribution
                      })
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Label htmlFor="employee_contribution" className="text-sm font-medium cursor-pointer">
                    Employee Contribution
                  </Label>
                  <Switch
                    id="employee_contribution"
                    checked={form_data.is_employee_contribution || false}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...form_data,
                        is_employee_contribution: checked,
                        is_employer_contribution: checked ? false : form_data.is_employer_contribution
                      })
                    }}
                  />
                </div>
              </div>
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

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handle_add_dialog_close} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Contribution'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={is_edit_dialog_open} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Contribution</DialogTitle>
              <DialogDescription>Update the contribution information below</DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handle_update(); }} className="space-y-5">
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
            </div>

            {/* Contribution Type Switches */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold">Contribution Type *</Label>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Label htmlFor="edit_employer_contribution" className="text-sm font-medium cursor-pointer">
                    Employer Contribution
                  </Label>
                  <Switch
                    id="edit_employer_contribution"
                    checked={edit_form_data.is_employer_contribution || false}
                    onCheckedChange={(checked) => {
                      setEditFormData({
                        ...edit_form_data,
                        is_employer_contribution: checked,
                        is_employee_contribution: checked ? false : edit_form_data.is_employee_contribution
                      })
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Label htmlFor="edit_employee_contribution" className="text-sm font-medium cursor-pointer">
                    Employee Contribution
                  </Label>
                  <Switch
                    id="edit_employee_contribution"
                    checked={edit_form_data.is_employee_contribution || false}
                    onCheckedChange={(checked) => {
                      setEditFormData({
                        ...edit_form_data,
                        is_employee_contribution: checked,
                        is_employer_contribution: checked ? false : edit_form_data.is_employer_contribution
                      })
                    }}
                  />
                </div>
              </div>
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Updating...' : 'Update Contribution'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={is_delete_dialog_open} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Contribution</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this contribution? This action cannot be undone.
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
