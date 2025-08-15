import axios from 'axios'

export interface WeatherData {
  temperature: number
  weather: string
  dayOfWeek: string
}

export async function getWeatherData(): Promise<WeatherData> {
  try {
    // 使用板橋測站資料
    const response = await axios.get(
      'https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=CWA-2972A4CE-3596-4E17-BA22-2E40E059301C&format=JSON&StationId=C0AJ80',
      {
        timeout: 10000, // 10秒超時
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )

    console.log('Weather API response status:', response.status)

    const data = response.data
    
    // 檢查 API 回應結構
    if (!data || !data.records || !data.records.Station || data.records.Station.length === 0) {
      console.warn('Weather API returned invalid data structure')
      return getDefaultWeatherData()
    }

    const station = data.records.Station[0]
    console.log('Station data:', JSON.stringify(station, null, 2))

    // 獲取天氣資訊 - 土城測站的資料結構
    const weatherElement = station.WeatherElement
    let temperature = 25 // 預設溫度
    let weather = '晴時多雲' // 預設天氣

    // 獲取當前溫度
    if (weatherElement.AirTemperature && weatherElement.AirTemperature !== '-99') {
      temperature = parseFloat(weatherElement.AirTemperature)
    } else {
      // 如果當前溫度無效，使用每日最高溫作為參考
      const dailyHigh = weatherElement.DailyExtreme?.DailyHigh?.TemperatureInfo?.AirTemperature
      if (dailyHigh) {
        temperature = parseFloat(dailyHigh)
      }
    }

    // 獲取天氣狀況
    if (weatherElement.Weather) {
      weather = weatherElement.Weather
    }

    // 獲取星期幾
    const today = new Date()
    const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()]

    console.log(`Weather data: ${temperature}°C, ${weather}, 星期${dayOfWeek}`)

    return {
      temperature,
      weather,
      dayOfWeek
    }

  } catch (error) {
    console.error('Error fetching weather data:', error)
    return getDefaultWeatherData()
  }
}

function getDefaultWeatherData(): WeatherData {
  const today = new Date()
  const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()]
  
  return {
    temperature: 25,
    weather: '晴時多雲',
    dayOfWeek
  }
}
