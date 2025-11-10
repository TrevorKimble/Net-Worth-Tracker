import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: id_param } = await params
    const id = parseInt(id_param)
    const body = await request.json()
    const { date, income_source, amount, notes } = body

    if (!date || !income_source || amount === undefined) {
      return NextResponse.json({ error: 'Date, income source, and amount are required' }, { status: 400 })
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const current_date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    // Format the provided date as MM/DD/YY
    const date_obj = new Date(date)
    const formatted_date = `${String(date_obj.getMonth() + 1).padStart(2, '0')}/${String(date_obj.getDate()).padStart(2, '0')}/${String(date_obj.getFullYear()).slice(-2)}`

    const income_entry = await prisma.incomeEntry.update({
      where: { id },
      data: {
        date: formatted_date,
        income_source,
        amount: parseFloat(amount),
        notes,
        updatedAt: current_date
      }
    })

    return NextResponse.json(income_entry)
  } catch (error) {
    console.error('Error updating income entry:', error)
    return NextResponse.json({ error: 'Failed to update income entry' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: id_param } = await params
    const id = parseInt(id_param)

    await prisma.incomeEntry.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting income entry:', error)
    return NextResponse.json({ error: 'Failed to delete income entry' }, { status: 500 })
  }
}

