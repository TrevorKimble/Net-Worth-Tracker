'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AssetData {
  name: string
  value: number
  type: string
}

interface AssetPieChartProps {
  data: AssetData[]
  title?: string
  description?: string
}

export function AssetPieChart({ data, title = 'Asset Breakdown', description }: AssetPieChartProps) {
  // Vibrant colors for different asset types
  const COLORS = {
    CASH: '#22c55e', // Green
    STOCK: '#3b82f6', // Blue
    CRYPTO: '#f59e0b', // Orange/Amber
    GOLD: '#eab308', // Yellow
    SILVER: '#94a3b8', // Slate gray
    MISC: '#a855f7', // Purple
  }

  const getColor = (type: string) => {
    return COLORS[type as keyof typeof COLORS] || COLORS.MISC
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Filter out assets with zero value
  const filteredData = data.filter(item => item.value > 0)

  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const percent = totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{percent}% of total</p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--foreground))"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            No assets available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              formatter={(value, entry: any) => {
                const data = filteredData.find(d => d.name === value)
                if (!data) return value
                return `${value}: ${formatCurrency(data.value)}`
              }}
              wrapperStyle={{ color: 'var(--foreground)' }}
              iconType="diamond"
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Total: {formatCurrency(totalValue)}
        </div>
      </CardContent>
    </Card>
  )
}
