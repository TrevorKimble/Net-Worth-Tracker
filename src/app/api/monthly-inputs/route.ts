import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const monthlyInputs = await prisma.monthlyInput.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    return NextResponse.json(monthlyInputs)
  } catch (error) {
    console.error('Error fetching monthly inputs:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly inputs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, year, cash, stocks, crypto, gold, silver, misc, notes } = body

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    const monthlyInput = await prisma.monthlyInput.upsert({
      where: {
        month_year: {
          month: parseInt(month),
          year: parseInt(year)
        }
      },
      update: {
        cash: parseFloat(cash) || 0,
        stocks: parseFloat(stocks) || 0,
        crypto: parseFloat(crypto) || 0,
        gold: parseFloat(gold) || 0,
        silver: parseFloat(silver) || 0,
        misc: parseFloat(misc) || 0,
        notes,
        updatedAt: currentDate
      },
      create: {
        month: parseInt(month),
        year: parseInt(year),
        cash: parseFloat(cash) || 0,
        stocks: parseFloat(stocks) || 0,
        crypto: parseFloat(crypto) || 0,
        gold: parseFloat(gold) || 0,
        silver: parseFloat(silver) || 0,
        misc: parseFloat(misc) || 0,
        notes,
        createdAt: currentDate,
        updatedAt: currentDate
      }
    })

    return NextResponse.json(monthlyInput)
  } catch (error) {
    console.error('Error creating/updating monthly input:', error)
    return NextResponse.json({ error: 'Failed to save monthly input' }, { status: 500 })
  }
}
