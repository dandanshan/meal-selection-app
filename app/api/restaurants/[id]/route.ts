import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        suggestedPeople: body.suggestedPeople,
        phone: body.phone,
        address: body.address,
        businessDays: JSON.stringify(body.businessDays),
        notSuitableForSummer: body.notSuitableForSummer,
        notSuitableForWinter: body.notSuitableForWinter,
        notSuitableForRainy: body.notSuitableForRainy,
        distance: body.distance
      }
    })
    return NextResponse.json(restaurant)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.restaurant.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    )
  }
}
