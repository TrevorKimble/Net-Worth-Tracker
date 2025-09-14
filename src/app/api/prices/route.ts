import { NextRequest, NextResponse } from 'next/server'
import { PriceService } from '@/lib/priceService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')
    const symbol = searchParams.get('symbol')
    const type = searchParams.get('type') as 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER'

    // Handle multiple symbols for market data
    if (symbols) {
      const symbolList = symbols.split(',')
      const priceService = PriceService.getInstance()
      const results: { [key: string]: number } = {}

      for (const sym of symbolList) {
        try {
          let price: number
          if (sym === '^GSPC') {
            price = await priceService.getStockPrice(sym)
          } else if (sym === 'GC=F') {
            price = await priceService.getPreciousMetalPrice('GOLD')
          } else if (sym === 'SI=F') {
            price = await priceService.getPreciousMetalPrice('SILVER')
          } else if (sym === 'BTC-USD') {
            price = await priceService.getCryptoPrice('BTC')
          } else {
            price = 0
          }
          results[sym] = price
        } catch (error) {
          console.error(`Error fetching price for ${sym}:`, error)
          results[sym] = 0
        }
      }

      return NextResponse.json(results)
    }

    // Handle single symbol (existing functionality)
    if (!symbol || !type) {
      return NextResponse.json({ error: 'Symbol and type are required' }, { status: 400 })
    }

    const priceService = PriceService.getInstance()
    const price = await priceService.getPrice(symbol, type)

    return NextResponse.json({ symbol, type, price, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('Error fetching price:', error)
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 })
  }
}

