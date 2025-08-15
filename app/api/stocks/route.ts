import { NextResponse } from 'next/server'

interface StockInfo {
  id: string
  name: string
  price: string
  change: string
  changePercent: string
  volume: string
  priceChange: string
}

export async function GET() {
  try {
    const response = await fetch('https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_0050.tw|tse_2330.tw|tse_2317.tw|tse_1216.tw|otc_6547.tw|otc_6180.tw', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data')
    }

    const data = await response.json()
    
    // 解析股票資料
    const stocks: StockInfo[] = []
    
    if (data.msgArray) {
      data.msgArray.forEach((stock: any) => {
        const stockId = stock.c
        const stockName = stock.n
        const currentPrice = stock.z || stock.o || stock.y || '--'
        const previousClose = stock.y || '--'
        
        // 計算漲跌幅和價格變化
        let changePercent = '--'
        let priceChange = '--'
        if (currentPrice !== '--' && previousClose !== '--' && currentPrice !== '-' && previousClose !== '-') {
          const current = parseFloat(currentPrice)
          const previous = parseFloat(previousClose)
          if (!isNaN(current) && !isNaN(previous) && previous > 0) {
            const change = ((current - previous) / previous * 100)
            const priceDiff = current - previous
            
            // 計算漲跌幅
            if (Math.abs(change) < 0.001) { // 如果變化小於 0.001%，視為平盤
              changePercent = '0.00'
            } else {
              changePercent = change.toFixed(2)
            }
            
            // 計算價格變化
            if (Math.abs(priceDiff) < 0.01) { // 如果價格變化小於 0.01，視為平盤
              priceChange = '0.00'
            } else {
              priceChange = priceDiff.toFixed(2)
            }
          }
        }
        
        const volume = stock.v || '--'

        stocks.push({
          id: stockId,
          name: stockName,
          price: currentPrice === '-' ? previousClose : currentPrice,
          change: previousClose,
          changePercent: changePercent,
          volume: volume,
          priceChange: priceChange
        })
      })
    }

    return NextResponse.json(stocks)
  } catch (error) {
    console.error('Error fetching stock data:', error)
    
    // 返回預設資料
    const defaultStocks: StockInfo[] = [
      { id: '0050', name: '元大台灣50', price: '--', change: '--', changePercent: '--', volume: '--', priceChange: '--' },
      { id: '2330', name: '台積電', price: '--', change: '--', changePercent: '--', volume: '--', priceChange: '--' },
      { id: '2317', name: '鴻海', price: '--', change: '--', changePercent: '--', volume: '--', priceChange: '--' },
      { id: '1216', name: '統一', price: '--', change: '--', changePercent: '--', volume: '--', priceChange: '--' },
      { id: '6547', name: '高端疫苗', price: '--', change: '--', changePercent: '--', volume: '--', priceChange: '--' },
      { id: '6180', name: '橘子', price: '--', change: '--', changePercent: '--', volume: '--', priceChange: '--' }
    ]
    
    return NextResponse.json(defaultStocks)
  }
}
