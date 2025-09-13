import { NextRequest, NextResponse } from 'next/server'
import { PriceService } from '@/lib/priceService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const type = searchParams.get('type') as 'STOCK' | 'CRYPTO' | 'GOLD' | 'SILVER'

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

