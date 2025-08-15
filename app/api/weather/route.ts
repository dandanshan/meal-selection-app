import { NextResponse } from 'next/server'
import { getWeatherData } from '@/lib/weather'

export async function GET() {
  try {
    const weatherData = await getWeatherData()
    return NextResponse.json(weatherData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    )
  }
}
