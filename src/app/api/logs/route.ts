import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Verify prisma client has activityLog
    if (!prisma?.activityLog) {
      console.error('Prisma client missing activityLog model. Restart dev server.')
      return NextResponse.json({ 
        error: 'Database client not initialized. Please restart the server.',
        logs: [],
        total: 0,
        page: 1,
        total_pages: 0,
        page_size: 50
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const portfolio = searchParams.get('portfolio')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (portfolio && portfolio !== 'all') {
      if (portfolio === 'PERSONAL') {
        where.table_name = 'personal_assets'
      } else if (portfolio === 'SOLO_401K') {
        where.table_name = 'solo_401k_assets'
      }
    }

    // Get total count for pagination
    const total_count = await prisma.activityLog.count({ where })

    // Get paginated logs
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    })

    // Parse JSON strings and format for display
    const formatted_logs = logs.map(log => {
      let old_values = null
      let new_values = null
      
      try {
        old_values = log.old_values ? JSON.parse(log.old_values) : null
      } catch (e) {
        console.error('Error parsing old_values:', e)
        old_values = null
      }
      
      try {
        new_values = log.new_values ? JSON.parse(log.new_values) : null
      } catch (e) {
        console.error('Error parsing new_values:', e)
        new_values = null
      }
      
      // Determine portfolio type from table name
      const portfolio_type = log.table_name === 'personal_assets' ? 'PERSONAL' : 
                       log.table_name === 'solo_401k_assets' ? 'SOLO_401K' : null
      
      // Extract relevant data from the JSON values
      const values = new_values || old_values || {}
      const is_update = log.operation === 'UPDATE' && old_values && new_values
      
      return {
        id: log.id,
        table_name: log.table_name,
        record_id: log.record_id,
        operation: log.operation as 'INSERT' | 'UPDATE' | 'DELETE',
        portfolio: portfolio_type as 'PERSONAL' | 'SOLO_401K' | null,
        symbol: values.symbol || '-',
        name: values.name || '-',
        type: values.type || '-',
        quantity: values.quantity,
        currentPrice: values.currentPrice || 0,
        totalValue: values.totalValue || 0,
        created_at: log.created_at,
        old_values: old_values,
        new_values: new_values,
        // For updates, show what changed
        changes: is_update ? {
          quantity: old_values.quantity !== new_values.quantity ? {
            from: old_values.quantity,
            to: new_values.quantity
          } : null,
          currentPrice: old_values.currentPrice !== new_values.currentPrice ? {
            from: old_values.currentPrice,
            to: new_values.currentPrice
          } : null,
          totalValue: old_values.totalValue !== new_values.totalValue ? {
            from: old_values.totalValue,
            to: new_values.totalValue
          } : null
        } : null
      }
    })

    const total_pages = Math.ceil(total_count / limit)

    return NextResponse.json({
      logs: formatted_logs,
      total: total_count,
      page,
      total_pages,
      page_size: limit
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}
