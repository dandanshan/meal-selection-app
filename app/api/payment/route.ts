import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { historyId, payerName, amount, receiptImage } = body

    const payment = await prisma.payment.create({
      data: {
        historyId,
        payerName,
        amount,
        receiptImage
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { historyId, payerName, amount, receiptImage } = body

    const payment = await prisma.payment.upsert({
      where: { historyId },
      update: {
        payerName,
        amount,
        receiptImage
      },
      create: {
        historyId,
        payerName,
        amount,
        receiptImage
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}
