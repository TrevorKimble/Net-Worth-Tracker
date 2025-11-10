import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const income_entries = await prisma.incomeEntry.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(income_entries)
  } catch (error) {
    console.error('Error fetching income entries:', error)
    return NextResponse.json({ error: 'Failed to fetch income entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, income_source, amount, notes } = body

    if (!date || !income_source || amount === undefined) {
      return NextResponse.json({ error: 'Date, income source, and amount are required' }, { status: 400 })
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const current_date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    const income_entry = await prisma.incomeEntry.create({
      data: {
        date,
        income_source,
        amount: parseFloat(amount),
        notes,
        createdAt: current_date,
        updatedAt: current_date
      }
    })

    return NextResponse.json(income_entry)
  } catch (error) {
    console.error('Error creating income entry:', error)
    return NextResponse.json({ error: 'Failed to save income entry' }, { status: 500 })
  }
}

