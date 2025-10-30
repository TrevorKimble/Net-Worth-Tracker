'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MonthlyInput {
  id: number
  month: number
  year: number
  cash: number
  stocks: number
  crypto: number
  gold: number
  silver: number
  misc: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface MonthlyInputChartProps {
  data: MonthlyInput[]
}

export function MonthlyInputChart({ data }: MonthlyInputChartProps) {
  const [viewMode, setViewMode] = useState<'overall' | 'variables'>('overall')
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'recent'>('all')

  // Sort data by year and month
  let sortedData = [...data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // Filter by time range
  if (timeRange === 'year') {
    const currentYear = new Date().getFullYear()
    sortedData = sortedData.filter(item => item.year === currentYear)
  } else if (timeRange === 'recent') {
    // Show last 12 months
    sortedData = sortedData.slice(-12)
  }

  // Format data for chart
  const chartData = sortedData.map(item => {
    const date = `${item.month}/${item.year}`
    const total = item.cash + item.stocks + item.crypto + item.gold + item.silver + item.misc
    
    if (viewMode === 'overall') {
      return {
        date,
        total,
      }
    } else {
      return {
        date,
        Cash: item.cash,
        Stocks: item.stocks,
        Crypto: item.crypto,
        Gold: item.gold,
        Silver: item.silver,
        Misc: item.misc,
      }
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Vibrant colors matching the image style
  const colors = {
    total: '#3b82f6', // Blue
    Cash: '#3b82f6', // Blue
    Stocks: '#22c55e', // Green
    Crypto: '#f59e0b', // Orange/Amber
    Gold: '#eab308', // Yellow
    Silver: '#94a3b8', // Slate gray
    Misc: '#a855f7', // Purple
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted p-1 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('all')}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  timeRange === 'all' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                ALL
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('year')}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  timeRange === 'year' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                YEAR
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('recent')}
                className={cn(
                  "h-7 px-3 text-xs font-medium",
                  timeRange === 'recent' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                RECENT
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'overall' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overall')}
              className="h-7 px-3 text-xs"
            >
              Overall
            </Button>
            <Button
              variant={viewMode === 'variables' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('variables')}
              className="h-7 px-3 text-xs"
            >
              By Category
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.total} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.total} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.Cash} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.Cash} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientStocks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.Stocks} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.Stocks} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientCrypto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.Crypto} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.Crypto} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.Gold} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.Gold} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientSilver" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.Silver} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.Silver} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="gradientMisc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.Misc} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.Misc} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={true} />
              <XAxis 
                dataKey="date" 
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
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend 
                wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                iconType="diamond"
              />
              {viewMode === 'overall' ? (
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke={colors.total}
                  strokeWidth={2}
                  fill="url(#gradientTotal)"
                  name="Total Net Worth"
                />
              ) : (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="Cash" 
                    stroke={colors.Cash}
                    strokeWidth={2}
                    fill="url(#gradientCash)"
                    name="Cash"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Stocks" 
                    stroke={colors.Stocks}
                    strokeWidth={2}
                    fill="url(#gradientStocks)"
                    name="Stocks"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Crypto" 
                    stroke={colors.Crypto}
                    strokeWidth={2}
                    fill="url(#gradientCrypto)"
                    name="Crypto"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Gold" 
                    stroke={colors.Gold}
                    strokeWidth={2}
                    fill="url(#gradientGold)"
                    name="Gold"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Silver" 
                    stroke={colors.Silver}
                    strokeWidth={2}
                    fill="url(#gradientSilver)"
                    name="Silver"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Misc" 
                    stroke={colors.Misc}
                    strokeWidth={2}
                    fill="url(#gradientMisc)"
                    name="Misc"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            No monthly input data available. Add some data in Monthly Input to see trends.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
