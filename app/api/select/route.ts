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

    // 球面距離（Haversine）計算
    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371; // 地球半徑,公里
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // 公里
    }

    // 過濾營業日、人數、距離
    const availableRestaurants = restaurants.filter(restaurant => {
      const businessDays = JSON.parse(restaurant.businessDays)
      const isOpenToday = businessDays.includes(currentDay)
      
      // 檢查建議人數是否符合
      const suggestedPeople = restaurant.suggestedPeople
      let isPeopleCountSuitable = false
      
      if (typeof suggestedPeople === 'string') {
        // 新格式：'1-4', '5-8', '9+'
        if (suggestedPeople === '1-4') {
          isPeopleCountSuitable = peopleCount <= 4
        } else if (suggestedPeople === '5-8') {
          isPeopleCountSuitable = peopleCount <= 8
        } else if (suggestedPeople === '9+') {
          isPeopleCountSuitable = true // 9人以上可以容納所有人數
        }
      } else if (typeof suggestedPeople === 'number') {
        // 舊格式：數字，保持向後相容
        isPeopleCountSuitable = peopleCount <= suggestedPeople
      }

      // 新增距離過濾
      let isWithinRadius = true;
      if (lat != null && lng != null && radius != null && restaurant.latitude != null && restaurant.longitude != null) {
        const distance = haversine(lat, lng, restaurant.latitude, restaurant.longitude);
        restaurant.distance = Number(distance.toFixed(2));
        isWithinRadius = distance <= radius;
      }
      
      return isOpenToday && isPeopleCountSuitable && isWithinRadius
    })

    if (availableRestaurants.length === 0) {
      return NextResponse.json(
        { error: '沒有符合條件的餐廳' },
        { status: 404 }
      )
    }

    // 隨機選擇餐廳
    const randomIndex = Math.floor(Math.random() * availableRestaurants.length)
    const selectedRestaurant = availableRestaurants[randomIndex]

    // 返回抽選結果和相關數據，不創建歷史紀錄
    return NextResponse.json({
      restaurant: selectedRestaurant,
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
