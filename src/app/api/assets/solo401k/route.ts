import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PriceService } from '@/lib/priceService'

export async function GET() {
  try {
    const assets = await prisma.solo401kAsset.findMany({
      orderBy: { symbol: 'asc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching Solo 401k assets:', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symbol, name, type, quantity, notes } = body

    if (!symbol || !name || !type || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current price and calculate total value
    let currentPrice: number
    let totalValue: number
    
    if (type === 'CASH' || type === 'MISC') {
      // For cash and misc, quantity IS the total value
      currentPrice = 1.00
      totalValue = quantity
    } else {
      // For stocks, crypto, gold, silver - multiply quantity by price
      const priceService = PriceService.getInstance()
      currentPrice = await priceService.getPrice(symbol, type as any)
      totalValue = quantity * currentPrice
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    // Create asset
    const asset = await prisma.solo401kAsset.create({
      data: {
        symbol,
        name,
        type: type as any,
        quantity,
        currentPrice,
        totalValue,
        notes: notes || null,
        lastUpdated: currentDate,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    })

    // Log the action
    await prisma.assetLog.create({
      data: {
        portfolio: 'SOLO_401K',
        symbol,
        action: 'INITIAL_ADD',
        price: currentPrice,
        totalValue,
        notes: `Initial add: ${quantity} ${symbol} at $${currentPrice}`,
        createdAt: currentDate
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error creating Solo 401k asset:', error)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
