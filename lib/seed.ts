import { prisma } from './prisma'

const defaultRestaurants = [
  {
    name: '小籠包專賣店',
    type: '中式',
    suggestedPeople: "1-4",
    phone: '02-1234-5678',
    address: '新北市板橋區中山路一段1號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    notSuitableForSummer: false,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 0.5
  },
  {
    name: '義式餐廳',
    type: '義式',
    suggestedPeople: "1-4",
    phone: '02-2345-6789',
    address: '新北市板橋區文化路二段2號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    notSuitableForSummer: false,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 0.8
  },
  {
    name: '日式拉麵店',
    type: '日式',
    suggestedPeople: "1-4",
    phone: '02-3456-7890',
    address: '新北市板橋區民權路三段3號',
    businessDays: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    notSuitableForSummer: true,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 0.3
  },
  {
    name: '韓式烤肉店',
    type: '韓式',
    suggestedPeople: "5-8",
    phone: '02-4567-8901',
    address: '新北市板橋區民生路四段4號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    notSuitableForSummer: true,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 1.2
  },
  {
    name: '泰式料理',
    type: '泰式',
    suggestedPeople: "1-4",
    phone: '02-5678-9012',
    address: '新北市板橋區中正路五段5號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    notSuitableForSummer: false,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 0.7
  },
  {
    name: '素食餐廳',
    type: '素食',
    suggestedPeople: "1-4",
    phone: '02-6789-0123',
    address: '新北市板橋區和平路六段6號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    notSuitableForSummer: false,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 0.9
  },
  {
    name: '火鍋店',
    type: '火鍋',
    suggestedPeople: "1-4",
    phone: '02-7890-1234',
    address: '新北市板橋區重慶路七段7號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    notSuitableForSummer: true,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 1.1
  },
  {
    name: '美式漢堡店',
    type: '美式',
    suggestedPeople: "1-4",
    phone: '02-8901-2345',
    address: '新北市板橋區板新路八段8號',
    businessDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    notSuitableForSummer: false,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: 0.6
  }
]

export async function seedDatabase() {
  try {
    // 檢查是否已有資料
    const existingRestCount = await prisma.restaurant.count();
    const existingColleagueCount = await prisma.colleague.count();
    if (existingRestCount > 0 && existingColleagueCount > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    // 新增預設餐廳
    if (existingRestCount === 0) {
      for (const restaurant of defaultRestaurants) {
        await prisma.restaurant.create({
          data: {
            ...restaurant,
            businessDays: JSON.stringify(restaurant.businessDays)
          }
        });
      }
    }
    // 新增預設同事
    if (existingColleagueCount === 0) {
      for (const colleague of defaultColleagues) {
        await prisma.colleague.create({ data: colleague });
      }
    }
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
