import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 取得過去一個月的記錄
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const history = await prisma.history.findMany({
      where: {
        date: {
          gte: oneMonthAgo
        }
      },
      include: {
        restaurant: true,
        payment: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // 先刪除所有付款記錄，因為它們與歷史記錄有外鍵關聯
    await prisma.payment.deleteMany({})
    
    // 然後刪除所有歷史記錄
    await prisma.history.deleteMany({})
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear history error:', error)
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { restaurantId, peopleCount, weather, isRaining, date } = body

    // 創建歷史紀錄
    const history = await prisma.history.create({
      data: {
        date: new Date(date),
        restaurantId,
        peopleCount,
        weather,
        isRaining,
        confirmed: true // 直接標記為已確認
      },
      include: {
        restaurant: true
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('History creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create history record' },
      { status: 500 }
    )
  }
}
