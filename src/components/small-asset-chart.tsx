'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SmallAssetChartProps {
  symbol: string
  title: string
}

export function SmallAssetChart({ symbol, title }: SmallAssetChartProps) {
  const encoded_symbol = encodeURIComponent(symbol)
  const iframe_src = `https://www.tradingview.com/widgetembed/?symbol=${encoded_symbol}&interval=D&theme=dark&style=3&locale=en&hide_side_toolbar=false&allow_symbol_change=false&calendar=false`

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full" style={{ height: '300px', minHeight: '300px' }}>
          <iframe
            key={symbol}
            src={iframe_src}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${title} Price Chart`}
            allow="clipboard-write"
          />
        </div>
      </CardContent>
    </Card>
  )
}

