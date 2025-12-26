'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Subscription {
  id?: number
  name: string
  purpose: string
  category: string
  cost: number
  billing_frequency: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'BIANNUAL'
  start_date: string
  notes?: string
}

const billing_frequencies = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Every 3 Months' },
  { value: 'BIANNUAL', label: 'Every 6 Months' },
  { value: 'YEARLY', label: 'Yearly' },
  { value: 'WEEKLY', label: 'Weekly' }
]

const categories = [
  'Personal',
  'TrevorK Software Solutions',
  '3D2A Supplies',
  'Based Industries'
]

export default function SubscriptionsPage() {
  const [form_data, setFormData] = useState<Subscription>({
    name: '',
    purpose: '',
    category: 'Personal',
    cost: 0,
    billing_frequency: 'MONTHLY',
    start_date: '',
    notes: ''
  })
  const [selected_date, setSelectedDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [existing_data, setExistingData] = useState<Subscription[]>([])
  const [editing_subscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [edit_date, setEditDate] = useState<Date | undefined>(undefined)
  const [edit_form_data, setEditFormData] = useState<Omit<Subscription, 'id' | 'start_date'>>({
    name: '',
    purpose: '',
    category: 'Personal',
    cost: 0,
    billing_frequency: 'MONTHLY' as const,
    notes: ''
  })
  const [delete_subscription_id, setDeleteSubscriptionId] = useState<number | null>(null)
  const [is_edit_dialog_open, setIsEditDialogOpen] = useState(false)
  const [is_delete_dialog_open, setIsDeleteDialogOpen] = useState(false)
  const [monthly_total, setMonthlyTotal] = useState(0)

  useEffect(() => {
    fetch_existing_data()
  }, [])

  const fetch_existing_data = async () => {
    try {
      const { getSubscriptionsAction } = await import('@/app/actions/subscriptions')
      const data = await getSubscriptionsAction()
      // Convert notes from null to undefined for component compatibility
      const formatted_data = (Array.isArray(data) ? data : []).map(sub => ({
        ...sub,
        notes: sub.notes ?? undefined
      }))
      setExistingData(formatted_data)
      // Calculate total after fetching data
      const { getMonthlyCostAction } = await import('@/app/actions/subscriptions')
      const total = await getMonthlyCostAction()
      setMonthlyTotal(total)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      setExistingData([])
    }
  }

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selected_date) {
      toast.error('Please select a start date')
      return
    }
    
    setLoading(true)

    try {
      const { createSubscriptionAction } = await import('@/app/actions/subscriptions')
      await createSubscriptionAction({
        ...form_data,
        start_date: selected_date.toISOString()
      })
      toast.success('Subscription saved successfully!')
      fetch_existing_data()
      // Reset form
      setFormData({
        name: '',
        purpose: '',
        category: 'Personal',
        cost: 0,
        billing_frequency: 'MONTHLY',
        start_date: '',
        notes: ''
      })
      setSelectedDate(undefined)
    } catch (error) {
      console.error('Error saving subscription:', error)
      const error_message = error instanceof Error ? error.message : 'Error saving subscription'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_edit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    // Parse MM/DD/YY format to Date object
    const [month, day, year] = subscription.start_date.split('/')
    const subscription_date = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
    setEditDate(subscription_date)
    setEditFormData({
      name: subscription.name,
      purpose: subscription.purpose,
      category: subscription.category,
      cost: subscription.cost,
      billing_frequency: subscription.billing_frequency,
      notes: subscription.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  const handle_update = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editing_subscription?.id || !edit_date) {
      toast.error('Please select a start date')
      return
    }
    
    setLoading(true)

    try {
      const { updateSubscriptionAction } = await import('@/app/actions/subscriptions')
      await updateSubscriptionAction({
        id: editing_subscription.id,
        ...edit_form_data,
        start_date: edit_date.toISOString()
      })
      toast.success('Subscription updated successfully!')
      fetch_existing_data()
      setIsEditDialogOpen(false)
      setEditingSubscription(null)
      setEditDate(undefined)
    } catch (error) {
      console.error('Error updating subscription:', error)
      const error_message = error instanceof Error ? error.message : 'Error updating subscription'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const handle_delete = async () => {
    if (!delete_subscription_id) return

    setLoading(true)

    try {
      const { deleteSubscriptionAction } = await import('@/app/actions/subscriptions')
      await deleteSubscriptionAction(delete_subscription_id)
      toast.success('Subscription deleted successfully!')
      fetch_existing_data()
      setIsDeleteDialogOpen(false)
      setDeleteSubscriptionId(null)
    } catch (error) {
      console.error('Error deleting subscription:', error)
      const error_message = error instanceof Error ? error.message : 'Error deleting subscription'
      toast.error(error_message)
    } finally {
      setLoading(false)
    }
  }

  const get_monthly_cost = (subscription: Subscription): number => {
    switch (subscription.billing_frequency) {
      case 'MONTHLY':
        return subscription.cost
      case 'YEARLY':
        return subscription.cost / 12
      case 'QUARTERLY':
        return subscription.cost / 3
      case 'BIANNUAL':
        return subscription.cost / 6
      case 'WEEKLY':
        return subscription.cost * 4.33
      default:
        return 0
    }
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground mt-2">Track your recurring subscriptions</p>
        </div>

        {/* Monthly Total Card */}
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Total Monthly Cost</CardTitle>
            <CardDescription>Sum of all subscriptions (normalized to monthly)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${monthly_total.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Add Subscription</CardTitle>
                <CardDescription>Enter your subscription information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handle_submit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form_data.name}
                      onChange={(e) => setFormData({ ...form_data, name: e.target.value })}
                      placeholder="e.g., Netflix, Spotify"
                      required
                    />
                  </div>

                  {/* Purpose */}
                  <div>
                    <Label htmlFor="purpose">Purpose</Label>
                    <Input
                      id="purpose"
                      value={form_data.purpose}
                      onChange={(e) => setFormData({ ...form_data, purpose: e.target.value })}
                      placeholder="e.g., Entertainment, Productivity"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={form_data.category}
                      onValueChange={(value) => setFormData({ ...form_data, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost */}
                  <div>
                    <Label htmlFor="cost">Cost ($)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={form_data.cost}
                      onChange={(e) => setFormData({ ...form_data, cost: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Billing Frequency */}
                  <div>
                    <Label htmlFor="billing_frequency">Billing Frequency</Label>
                    <Select
                      value={form_data.billing_frequency}
                      onValueChange={(value: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'BIANNUAL') => 
                        setFormData({ ...form_data, billing_frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select billing frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {billing_frequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <DatePicker
                      date={selected_date}
                      onDateChange={setSelectedDate}
                      placeholder="Pick a date"
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
                    {loading ? 'Saving...' : 'Save Subscription'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>All your subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Purpose</th>
                    <th className="text-left p-2 font-medium">Category</th>
                    <th className="text-left p-2 font-medium">Cost</th>
                    <th className="text-left p-2 font-medium">Frequency</th>
                    <th className="text-left p-2 font-medium">Monthly Cost</th>
                    <th className="text-left p-2 font-medium">Start Date</th>
                    <th className="text-left p-2 font-medium">Notes</th>
                    <th className="text-right p-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(existing_data || []).map((subscription) => {
                    const monthly_cost = get_monthly_cost(subscription)
                    return (
                      <tr key={subscription.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 font-medium">{subscription.name}</td>
                        <td className="p-2">{subscription.purpose}</td>
                        <td className="p-2">{subscription.category}</td>
                        <td className="p-2">${subscription.cost.toLocaleString()}</td>
                        <td className="p-2">
                          {billing_frequencies.find(f => f.value === subscription.billing_frequency)?.label || subscription.billing_frequency}
                        </td>
                        <td className="p-2 font-medium text-primary">${monthly_cost.toFixed(2)}</td>
                        <td className="p-2">{subscription.start_date}</td>
                        <td className="p-2 text-muted-foreground">{subscription.notes || '-'}</td>
                        <td className="p-2">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handle_edit(subscription)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteSubscriptionId(subscription.id || null)
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
                      <td colSpan={9} className="p-4 text-center text-muted-foreground">
                        No subscriptions yet
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
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>Update the subscription information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handle_update} className="space-y-4">
              <div>
                <Label htmlFor="edit_name">Name</Label>
                <Input
                  id="edit_name"
                  value={edit_form_data.name}
                  onChange={(e) => setEditFormData({ ...edit_form_data, name: e.target.value })}
                  placeholder="e.g., Netflix, Spotify"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_purpose">Purpose</Label>
                <Input
                  id="edit_purpose"
                  value={edit_form_data.purpose}
                  onChange={(e) => setEditFormData({ ...edit_form_data, purpose: e.target.value })}
                  placeholder="e.g., Entertainment, Productivity"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_category">Category</Label>
                <Select
                  value={edit_form_data.category}
                  onValueChange={(value) => setEditFormData({ ...edit_form_data, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_cost">Cost ($)</Label>
                <Input
                  id="edit_cost"
                  type="number"
                  step="0.01"
                  value={edit_form_data.cost}
                  onChange={(e) => setEditFormData({ ...edit_form_data, cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_billing_frequency">Billing Frequency</Label>
                <Select
                  value={edit_form_data.billing_frequency}
                  onValueChange={(value: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY' | 'BIANNUAL') => 
                    setEditFormData({ ...edit_form_data, billing_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {billing_frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_start_date">Start Date</Label>
                <DatePicker
                  date={edit_date}
                  onDateChange={setEditDate}
                  placeholder="Pick a date"
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
              <DialogTitle>Delete Subscription</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subscription? This action cannot be undone.
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

