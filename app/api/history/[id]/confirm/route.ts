import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const history = await prisma.history.update({
      where: { id: params.id },
      data: { confirmed: true }
    })
    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to confirm history' },
      { status: 500 }
    )
  }
}
