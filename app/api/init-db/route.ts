import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // 檢查資料庫連接
    await prisma.$connect()
    
    // 執行 Prisma db push 來同步 schema
    const { execSync } = require('child_process')
    try {
      console.log('Pushing database schema...')
      execSync('npx prisma db push --accept-data-loss', { 
        stdio: 'inherit',
        env: { ...process.env }
      })
      console.log('Database schema pushed successfully')
    } catch (error) {
      console.log('Prisma db push failed:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to push database schema' 
      }, { status: 500 })
    }
    
    // 檢查是否有餐廳資料
    const restaurantCount = await prisma.restaurant.count()
    
    if (restaurantCount === 0) {
      // 如果沒有資料，建立範例資料
      console.log('Creating sample data...')
      await prisma.restaurant.createMany({
        data: [
          {
            name: '麥當勞',
            type: '速食',
            suggestedPeople: 4,
            address: '台北市信義區信義路五段7號',
            phone: '02-2345-6789',
            businessDays: '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]',
            notSuitableForRainy: false,
            distance: 0.5
          },
          {
            name: '肯德基',
            type: '速食',
            suggestedPeople: 4,
            address: '台北市信義區松高路12號',
            phone: '02-2345-6790',
            businessDays: '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]',
            notSuitableForRainy: false,
            distance: 0.8
          },
          {
            name: '星巴克',
            type: '咖啡',
            suggestedPeople: 2,
            address: '台北市信義區信義路五段8號',
            phone: '02-2345-6791',
            businessDays: '["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]',
            notSuitableForRainy: false,
            distance: 0.3
          }
        ]
      })
      console.log('Sample data created successfully')
    }
    
    const finalCount = await prisma.restaurant.count()
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: '資料庫初始化成功',
      restaurantCount: finalCount
    })
  } catch (error: any) {
    console.error('資料庫初始化錯誤:', error)
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
