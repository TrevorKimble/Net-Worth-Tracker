import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const table_name = searchParams.get('table_name')
    const record_id = searchParams.get('record_id')
    const operation = searchParams.get('operation')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}
    
    if (table_name) {
      where.table_name = table_name
    }
    
    if (record_id) {
      where.record_id = parseInt(record_id)
    }
    
    if (operation) {
      where.operation = operation
    }

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit
    })

    // Parse JSON strings to objects for easier use
    const parsed_logs = logs.map(log => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null
    }))

    return NextResponse.json(parsed_logs)
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}

