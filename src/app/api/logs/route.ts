import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolio = searchParams.get('portfolio')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where = portfolio ? { portfolio: portfolio as any } : {}

    const logs = await prisma.assetLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

