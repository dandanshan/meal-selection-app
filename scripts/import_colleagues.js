// 匯入 colleague CSV 檔案到資料庫
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const csvPath = path.join(__dirname, '../colleagues.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('找不到 colleagues.csv，請放在專案根目錄')
    process.exit(1)
  }
  const content = fs.readFileSync(csvPath, 'utf-8')
  const lines = content.split(/\r?\n/).map(line => line.trim()).filter(Boolean)

  for (const name of lines) {
    // 避免重複資料
    const exists = await prisma.colleague.findFirst({ where: { name } })
    if (!exists) {
      await prisma.colleague.create({ data: { name } })
      console.log(`已新增：${name}`)
    } else {
      console.log(`已存在，略過：${name}`)
    }
  }
  console.log('匯入完成！')
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
