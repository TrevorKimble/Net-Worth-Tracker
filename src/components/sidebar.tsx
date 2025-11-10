'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Wallet, Building2, Calendar, Activity, Home, DollarSign, ArrowRightLeft } from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Personal', href: '/personal', icon: Wallet },
  { name: 'Solo 401k', href: '/solo401k', icon: Building2 },
  { name: 'Monthly Input', href: '/monthly', icon: Calendar },
  { name: 'Income', href: '/income', icon: DollarSign },
  { name: 'Conversions', href: '/conversions', icon: ArrowRightLeft },
  { name: 'Activity Log', href: '/logs', icon: Activity },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Net Worth Tracker</h1>
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
