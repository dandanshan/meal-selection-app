import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { peopleCount, isRaining, weather, temperature, radius, lat, lng } = body

    // 取得本週已抽選過的餐廳 ID
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const weeklyHistory = await prisma.history.findMany({
      where: {
        date: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      },
      select: { restaurantId: true }
    })

    const excludedRestaurantIds = weeklyHistory.map(h => h.restaurantId)

    // 取得今天星期幾
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = 日, 1 = 一, ..., 6 = 六
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDay = dayNames[dayOfWeek]

    // 篩選條件
    const whereConditions: any = {
      id: {
        notIn: excludedRestaurantIds
      }
    }

    // 天氣條件篩選
    if (temperature > 28) {
      whereConditions.notSuitableForSummer = false
    }
    if (temperature < 18) {
      whereConditions.notSuitableForWinter = false
    }
    if (isRaining) {
      whereConditions.notSuitableForRainy = false
    }

    // 取得所有符合條件的餐廳
    const restaurants = await prisma.restaurant.findMany({
      where: whereConditions
    })

    // 過濾營業日、人數、距離
    const availableRestaurants = restaurants.filter(restaurant => {
      const businessDays = JSON.parse(restaurant.businessDays)
      const isOpenToday = businessDays.includes(currentDay)
      
      // 檢查建議人數是否符合
      const suggestedPeople = restaurant.suggestedPeople
      let isPeopleCountSuitable = false
      
      if (typeof suggestedPeople === 'string') {
        // 支援 '1-4', '4-8', '9+', '1', ...，只要 peopleCount 落在區間內
        let isValid = false
        if (suggestedPeople.includes('-')) {
          // 例如 '1-4', '4-8'
          const [min, max] = suggestedPeople.split('-').map(Number);
          isValid = peopleCount >= min && peopleCount <= max;
        } else if (/\d+\+/.test(suggestedPeople)) {
          // 例如 '9+'，下限比對
          const min = Number(suggestedPeople.replace('+', ''));
          isValid = peopleCount >= min;
        } else {
          // 只有單一數字
          isValid = peopleCount === Number(suggestedPeople);
        }
        isPeopleCountSuitable = isValid
      } else if (typeof suggestedPeople === 'number') {
        isPeopleCountSuitable = peopleCount <= suggestedPeople;
      }

      // 新增距離過濾 (根據 seed.ts 給定的 distance 欄位)
      let isWithinRadius = true;
      if (radius != null && restaurant.distance != null) {
        isWithinRadius = restaurant.distance <= radius
      }
      
      return isOpenToday && isPeopleCountSuitable && isWithinRadius
    })

    if (availableRestaurants.length === 0) {
      return NextResponse.json(
        { error: '沒有符合條件的餐廳' },
        { status: 404 }
      )
    }

    // 假設靜態資料的餐廳會有一個特殊欄位例如 isStatic 或某個 id 格式
    // 如果 static 資料放在DB以外的來源（如 /static-restaurants.json），這裡要加上邏輯
    // 這裡假設全部都是從DB，如果要比對可依某欄位或 id 格式判斷
    // 範例：判斷 selectedRestaurant.isStatic 或 id 是 'STATIC_xxx'

    // 隨機選擇餐廳
    const randomIndex = Math.floor(Math.random() * availableRestaurants.length)
    const selectedRestaurant = availableRestaurants[randomIndex]

    // 判斷來源
    let restaurantSource: 'db' | 'static' = 'db'
    if (selectedRestaurant.isStatic === true || (typeof selectedRestaurant.id === 'string' && selectedRestaurant.id.startsWith('STATIC'))) {
      restaurantSource = 'static'
    }

    // 返回抽選結果和相關數據，不創建歷史紀錄
    return NextResponse.json({
      restaurant: selectedRestaurant,
      restaurantSource, // 標示來源
      selectionData: {
        peopleCount,
        weather,
        isRaining,
        date: today
      }
    })
  } catch (error) {
    console.error('Selection error:', error)
    return NextResponse.json(
      { error: 'Failed to select restaurant' },
      { status: 500 }
    )
  }
}

