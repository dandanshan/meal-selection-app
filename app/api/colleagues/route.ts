import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const colleagues = await prisma.colleague.findMany({ orderBy: { name: 'asc' } })
    return NextResponse.json(colleagues)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch colleagues' }, { status: 500 })
  }
}
