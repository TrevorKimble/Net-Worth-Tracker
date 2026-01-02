'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Wallet, Building2, Calendar, Activity, Home, DollarSign, ArrowRightLeft, CreditCard, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateAllAssetPrices } from '@/services/batch-price-update'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Personal', href: '/personal', icon: Wallet },
  { name: 'Solo 401k', href: '/solo401k', icon: Building2 },
  { name: 'Monthly Input', href: '/monthly', icon: Calendar },
  { name: 'Income', href: '/income', icon: DollarSign },
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Conversions', href: '/conversions', icon: ArrowRightLeft },
  { name: 'Activity Log', href: '/logs', icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()
  const [is_updating, set_is_updating] = useState(false)
  const [update_status, set_update_status] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handle_price_update = async () => {
    set_is_updating(true)
    set_update_status(null)
    
    try {
      const result = await updateAllAssetPrices()
      
      if (result.failed === 0) {
        set_update_status({
          success: true,
          message: `Successfully updated ${result.updated} asset${result.updated !== 1 ? 's' : ''}`
        })
      } else {
        set_update_status({
          success: false,
          message: `Updated ${result.updated}, failed ${result.failed}`
        })
      }
    } catch (error) {
      set_update_status({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update prices'
      })
    } finally {
      set_is_updating(false)
      // Clear status after 5 seconds
      setTimeout(() => {
        set_update_status(null)
      }, 5000)
    }
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Net Worth Tracker</h1>
      </div>
      
      {/* Price Update Button */}
      <div className="px-3 py-3 border-b border-border">
        <Button
          onClick={handle_price_update}
          disabled={is_updating}
          className="w-full"
          variant="outline"
          size="sm"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", is_updating && "animate-spin")} />
          {is_updating ? 'Updating...' : 'Update Prices'}
        </Button>
        {update_status && (
          <div className={cn(
            "mt-2 flex items-center gap-2 text-xs",
            update_status.success ? "text-green-500" : "text-red-500"
          )}>
            {update_status.success ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            <span>{update_status.message}</span>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
