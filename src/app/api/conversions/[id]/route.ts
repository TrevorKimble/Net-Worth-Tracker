import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { date, amount, notes } = body

    if (!date || amount === undefined) {
      return NextResponse.json({ error: 'Date and amount are required' }, { status: 400 })
    }

    // Format current date as MM/DD/YY
    const now = new Date()
    const current_date = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${String(now.getFullYear()).slice(-2)}`

    // Format the provided date as MM/DD/YY
    const date_obj = new Date(date)
    const formatted_date = `${String(date_obj.getMonth() + 1).padStart(2, '0')}/${String(date_obj.getDate()).padStart(2, '0')}/${String(date_obj.getFullYear()).slice(-2)}`

    const conversion = await prisma.solo401kConversion.update({
      where: { id },
      data: {
        date: formatted_date,
        amount: parseFloat(amount),
        notes,
        updatedAt: current_date
      }
    })

    return NextResponse.json(conversion)
  } catch (error) {
    console.error('Error updating conversion:', error)
    return NextResponse.json({ error: 'Failed to update conversion' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.solo401kConversion.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversion:', error)
    return NextResponse.json({ error: 'Failed to delete conversion' }, { status: 500 })
  }
}

