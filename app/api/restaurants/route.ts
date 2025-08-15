import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('GET /api/restaurants error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restaurants', details: String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const restaurant = await prisma.restaurant.create({
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
      { error: 'Failed to create restaurant' },
      { status: 500 }
    )
  }
}
