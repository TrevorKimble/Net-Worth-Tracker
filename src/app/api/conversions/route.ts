import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const conversions = await prisma.solo401kConversion.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(conversions)
  } catch (error) {
    console.error('Error fetching conversions:', error)
    return NextResponse.json({ error: 'Failed to fetch conversions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, amount, notes } = body

    if (!date || amount === undefined) {
      return NextResponse.json({ error: 'Date and amount are required' }, { status: 400 })
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const current_date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    const conversion = await prisma.solo401kConversion.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        notes,
        createdAt: current_date,
        updatedAt: current_date
      }
    })

    return NextResponse.json(conversion)
  } catch (error) {
    console.error('Error creating conversion:', error)
    return NextResponse.json({ error: 'Failed to save conversion' }, { status: 500 })
  }
}

