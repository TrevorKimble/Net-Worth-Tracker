'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TickerOption {
  tradingview_symbol: string
  display_name: string
  asset_type: string
}

function format_symbol_for_tradingview(symbol: string, asset_type: string): string {
  switch (asset_type) {
    case 'STOCK':
      // Stocks use symbol as-is
      return symbol
    case 'CRYPTO':
      // Crypto: convert "BTC" to "BINANCE:BTCUSD" or "COINBASE:BTC-USD"
      // Try BINANCE first as it's more common
      if (symbol.includes('/')) {
        // Already formatted like "BTC/USD"
        const [base, quote] = symbol.split('/')
        return `BINANCE:${base}${quote}`
      }
      return `BINANCE:${symbol}USD`
    case 'GOLD':
      return 'TVC:GOLD'
    case 'SILVER':
      return 'TVC:SILVER'
    default:
      return symbol
  }
}

export function AssetChart() {
  const [selected_ticker, set_selected_ticker] = useState<string>('TVC:GOLD')
  const [ticker_options, set_ticker_options] = useState<TickerOption[]>([])
  const [loading, set_loading] = useState(true)

  useEffect(() => {
    async function fetch_tickers() {
      try {
        const { getPersonalAssets, getSolo401kAssets } = await import('@/services/assets')
        const [personal_assets, solo_401k_assets] = await Promise.all([
          getPersonalAssets(),
          getSolo401kAssets()
        ])

        // Combine and filter out CASH and MISC
        const all_assets = [...personal_assets, ...solo_401k_assets]
        const chartable_assets = all_assets.filter(
          asset => asset.type !== 'CASH' && asset.type !== 'MISC'
        )

        // Create unique ticker options
        const ticker_map = new Map<string, TickerOption>()

        chartable_assets.forEach(asset => {
          const tradingview_symbol = format_symbol_for_tradingview(asset.symbol, asset.type)
          const display_name = `${asset.name} (${asset.symbol})`

          // Use tradingview_symbol as key to avoid duplicates
          if (!ticker_map.has(tradingview_symbol)) {
            ticker_map.set(tradingview_symbol, {
              tradingview_symbol,
              display_name,
              asset_type: asset.type
            })
          }
        })

        // Add default Gold option if not present
        if (!ticker_map.has('TVC:GOLD')) {
          ticker_map.set('TVC:GOLD', {
            tradingview_symbol: 'TVC:GOLD',
            display_name: 'Gold (GC=F)',
            asset_type: 'GOLD'
          })
        }

        const options = Array.from(ticker_map.values()).sort((a, b) =>
          a.display_name.localeCompare(b.display_name)
        )

        set_ticker_options(options)
        set_loading(false)
      } catch (error) {
        console.error('Error fetching tickers:', error)
        set_loading(false)
        // Set default option
        set_ticker_options([{
          tradingview_symbol: 'TVC:GOLD',
          display_name: 'Gold (GC=F)',
          asset_type: 'GOLD'
        }])
      }
    }

    fetch_tickers()
  }, [])

  const encoded_symbol = encodeURIComponent(selected_ticker)
  const iframe_src = `https://www.tradingview.com/widgetembed/?symbol=${encoded_symbol}&interval=D&theme=dark&style=3&locale=en&hide_side_toolbar=false&allow_symbol_change=false&calendar=false`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Asset Price Chart</CardTitle>
          {!loading && (
            <Select value={selected_ticker} onValueChange={set_selected_ticker}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a ticker" />
              </SelectTrigger>
              <SelectContent>
                {ticker_options.map((option) => (
                  <SelectItem key={option.tradingview_symbol} value={option.tradingview_symbol}>
                    {option.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full" style={{ height: '800px', minHeight: '800px' }}>
          <iframe
            key={selected_ticker}
            src={iframe_src}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${selected_ticker} Price Chart`}
            allow="clipboard-write"
          />
        </div>
      </CardContent>
    </Card>
  )
}

