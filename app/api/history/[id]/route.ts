import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 驗證 ID 格式
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: '無效的歷史記錄 ID' },
        { status: 400 }
      )
    }

    // 檢查歷史記錄是否存在
    const existingHistory = await prisma.history.findUnique({
      where: { id },
      include: {
        payment: true
      }
    })

    if (!existingHistory) {
      return NextResponse.json(
        { error: '歷史記錄不存在' },
        { status: 404 }
      )
    }

    // 刪除相關的付款記錄（如果存在）
    if (existingHistory.payment) {
      await prisma.payment.delete({
        where: { id: existingHistory.payment.id }
      })
    }

    // 刪除歷史記錄
    await prisma.history.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: '歷史記錄已成功刪除' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting history:', error)
    return NextResponse.json(
      { error: '刪除歷史記錄時發生錯誤' },
      { status: 500 }
    )
  }
}
