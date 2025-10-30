import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PriceService } from '@/lib/priceService'

export async function GET() {
  try {
    const assets = await prisma.personalAsset.findMany({
      orderBy: { symbol: 'asc' }
    })

    return NextResponse.json(assets)
  } catch (error) {
    console.error('Error fetching personal assets:', error)
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
    const asset = await prisma.personalAsset.create({
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
        portfolio: 'PERSONAL',
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
    console.error('Error creating personal asset:', error)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, symbol, name, type, quantity, notes } = body

    if (!id || !symbol || !name || !type || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current price and calculate total value
    let currentPrice: number
    let totalValue: number
    
    if (type === 'CASH' || type === 'MISC') {
      currentPrice = 1.00
      totalValue = quantity
    } else {
      const priceService = PriceService.getInstance()
      currentPrice = await priceService.getPrice(symbol, type as any)
      totalValue = quantity * currentPrice
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    // Update asset
    const asset = await prisma.personalAsset.update({
      where: { id },
      data: {
        symbol,
        name,
        type: type as any,
        quantity,
        currentPrice,
        totalValue,
        notes: notes || null,
        lastUpdated: currentDate,
        updatedAt: currentDate
      }
    })

    // Log the action
    await prisma.assetLog.create({
      data: {
        portfolio: 'PERSONAL',
        symbol,
        action: 'MANUAL_UPDATE',
        price: currentPrice,
        totalValue,
        notes: `Manual update: ${quantity} ${symbol} at $${currentPrice}`,
        createdAt: currentDate
      }
    })

    return NextResponse.json(asset)
  } catch (error) {
    console.error('Error updating personal asset:', error)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 })
    }

    // Get asset before deleting for logging
    const asset = await prisma.personalAsset.findUnique({
      where: { id: parseInt(id) }
    })

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
    }

    // Delete asset
    await prisma.personalAsset.delete({
      where: { id: parseInt(id) }
    })

    // Format current date as MM/DD/YY
    const now = new Date()
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    // Log the deletion
    await prisma.assetLog.create({
      data: {
        portfolio: 'PERSONAL',
        symbol: asset.symbol,
        action: 'SELL',
        price: asset.currentPrice,
        totalValue: 0,
        notes: `Asset deleted: ${asset.symbol}`,
        createdAt: currentDate
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting personal asset:', error)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
