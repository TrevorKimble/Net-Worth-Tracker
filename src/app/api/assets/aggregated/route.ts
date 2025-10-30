import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const portfolio = searchParams.get('portfolio') // 'personal', 'solo401k', or null for all

    let personalAssets: any[] = []
    let solo401kAssets: any[] = []

    if (!portfolio || portfolio === 'personal') {
      personalAssets = await prisma.personalAsset.findMany({
        select: {
          name: true,
          type: true,
          totalValue: true,
        },
      })
    }

    if (!portfolio || portfolio === 'solo401k') {
      solo401kAssets = await prisma.solo401kAsset.findMany({
        select: {
          name: true,
          type: true,
          totalValue: true,
        },
      })
    }

    // Group by asset type
    const groupedData: Record<string, { name: string; value: number; type: string }> = {}

    const processAssets = (assets: any[]) => {
      assets.forEach(asset => {
        const type = asset.type
        const typeName = type === 'STOCK' ? 'Stocks' :
                        type === 'CRYPTO' ? 'Crypto' :
                        type === 'GOLD' ? 'Gold' :
                        type === 'SILVER' ? 'Silver' :
                        type === 'CASH' ? 'Cash' : 'Misc'
        
        if (!groupedData[type]) {
          groupedData[type] = {
            name: typeName,
            value: 0,
            type: type,
          }
        }
        groupedData[type].value += asset.totalValue
      })
    }

    processAssets(personalAssets)
    processAssets(solo401kAssets)

    return NextResponse.json(Object.values(groupedData))
  } catch (error) {
    console.error('Error fetching aggregated assets:', error)
    return NextResponse.json({ error: 'Failed to fetch aggregated assets' }, { status: 500 })
  }
}

