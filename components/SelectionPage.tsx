'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { Cloud, Sun, CloudRain, Dice6, Phone, MapPin, Users, TrendingUp, TrendingDown, Settings, Laugh, BarChart3, Utensils } from 'lucide-react'
import { getRandomJoke } from '@/lib/jokes'
import { useTheme } from '@/components/ThemeProvider'
import { useToast } from '@/hooks/use-toast'

interface WeatherData {
  temperature: number
  weather: string
  dayOfWeek: string
  relativeHumidity: number
  precipitationHour: number
}

interface Restaurant {
  id: string
  name: string
  type: string
  suggestedPeople: number
  phone?: string
  address?: string
  distance?: number
}

interface History {
  id: string
  restaurant: Restaurant
  peopleCount: number
  weather: string
  isRaining: boolean
}

interface StockInfo {
  id: string
  name: string
  price: string
  change: string
  changePercent: string
  volume: string
  priceChange: string
}

// 體感溫度 (Heat Index) 計算
function calcHeatIndex(temp: number, rh: number) {
  if (!temp || !rh) return "-"
  // NOAA公式，攝氏版本
  const hi = -8.784695 + 1.61139411 * temp + 2.338549 * rh - 0.14611605 * temp * rh
    - 0.01230809 * temp * temp - 0.01642482 * rh * rh
    + 0.00221173 * temp * temp * rh + 0.00072546 * temp * rh * rh
    - 0.00000358 * temp * temp * rh * rh;
  return hi.toFixed(1);
}

export default function SelectionPage() {
  const [peopleCount, setPeopleCount] = useState<number | ''>('')
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isRaining, setIsRaining] = useState<string>('no')
  const [selectedResult, setSelectedResult] = useState<{ restaurant: Restaurant; selectionData: any } | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [currentJoke, setCurrentJoke] = useState('')
  const [stockData, setStockData] = useState<StockInfo[]>([])
  const [loading, setLoading] = useState(false)
  // 方圓範圍選項 state
  const [radius, setRadius] = useState(0.5) // 預設近: 0.5km
  // 已移除定位資訊
  const { theme } = useTheme()
  const { toast } = useToast()



  useEffect(() => {
    fetchWeatherData()
    fetchStockData()
    setCurrentJoke(getRandomJoke(theme))
    // 進頁面不主動抓 location！只在第一次抽選時抓
  }, [theme])

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('/api/weather')
      const data = await response.json()
      setWeatherData(data)
    } catch (error) {
      console.error('Error fetching weather data:', error)
      // 使用預設值
      const today = new Date()
      const days = ['日', '一', '二', '三', '四', '五', '六']
      setWeatherData({
        temperature: 25,
        weather: '晴時多雲',
        dayOfWeek: days[today.getDay()],
        relativeHumidity: 70,
        precipitationHour: 0
      })
    }
  }

  const fetchStockData = async () => {
    try {
      const response = await fetch('/api/stocks')
      const data = await response.json()
      setStockData(data)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      setStockData([])
    }
  }

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('雨')) return <CloudRain className="w-6 h-6" />
    if (weather.includes('雲')) return <Cloud className="w-6 h-6" />
    return <Sun className="w-6 h-6" />
  }

  const handleSelectRestaurant = async () => {
    if (!peopleCount || isRaining === '' || !weatherData) {
      toast({
        title: "請填寫完整資訊",
        description: "請確保已填寫用餐人數和天氣狀況",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peopleCount: Number(peopleCount),
          isRaining: isRaining === 'yes',
          weather: weatherData.weather,
          temperature: weatherData.temperature,
          radius
        })
      })

      if (!response.ok) {
        const error = await response.json()
        toast({
          title: "抽選失敗",
          description: error.error || '沒有符合條件的餐廳',
          variant: "destructive",
        })
        return
      }

      const result = await response.json()
      setSelectedResult(result)
      setShowConfirmDialog(true)
    } catch (error) {
      console.error('Error selecting restaurant:', error)
      toast({
        title: "抽選失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSelection = async () => {
    if (!selectedResult) return

    try {
      // 創建歷史紀錄
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: selectedResult.restaurant.id,
          peopleCount: selectedResult.selectionData.peopleCount,
          weather: selectedResult.selectionData.weather,
          isRaining: selectedResult.selectionData.isRaining,
          date: selectedResult.selectionData.date
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create history record')
      }

      setShowConfirmDialog(false)
      setSelectedResult(null)
      toast({
        title: "已確認選擇",
        description: "已保存到歷史記錄！",
      })
    } catch (error) {
      console.error('Error confirming selection:', error)
      toast({
        title: "確認失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleReselectRestaurant = async () => {
    if (!peopleCount || isRaining === '' || !weatherData) {
      toast({
        title: "請填寫完整資訊",
        description: "請確保已填寫用餐人數和天氣狀況",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          peopleCount: Number(peopleCount),
          isRaining: isRaining === 'yes',
          weather: weatherData.weather,
          temperature: weatherData.temperature
        })
      })

      if (!response.ok) {
        const error = await response.json()
        toast({
          title: "抽選失敗",
          description: error.error || '請稍後再試',
          variant: "destructive",
        })
        return
      }

      const result = await response.json()
      setSelectedResult(result)
      // 保持對話框開啟，但更新選擇結果
    } catch (error) {
      console.error('Error reselecting restaurant:', error)
      toast({
        title: "重新抽選失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }



  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 選擇條件 */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              選擇條件
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="people-count" className="mb-3 block">用餐人數</Label>
              <Input
                id="people-count"
                type="number"
                min="1"
                placeholder="請輸入人數"
                value={peopleCount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setPeopleCount('');
                  } else {
                    const numValue = Number(value);
                    if (numValue >= 1) {
                      setPeopleCount(numValue);
                    }
                  }
                }}
              />
            </div>

            <div>
              <Label className="mb-3 block">是否下雨</Label>
              <div className="flex gap-2 mt-2">
                <Toggle
                  pressed={isRaining === "no"}
                  onPressedChange={(pressed) => setIsRaining(pressed ? "no" : "")}
                  className="justify-center px-2 sm:px-4 py-2 text-sm flex-1"
                  variant="outline"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    {theme === "mario" ? "☀️" : <Sun className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline">否</span>
                    <span className="sm:hidden">否</span>
                  </div>
                </Toggle>
                <Toggle
                  pressed={isRaining === "yes"}
                  onPressedChange={(pressed) => setIsRaining(pressed ? "yes" : "")}
                  className="justify-center px-2 sm:px-4 py-2 text-sm flex-1"
                  variant="outline"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    {theme === "mario" ? "🌧️" : <CloudRain className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="hidden sm:inline">是</span>
                    <span className="sm:hidden">是</span>
                  </div>
                </Toggle>
              </div>
            </div>

            <div>
              <Label className="mb-3 block flex items-center gap-1">
                距離
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center cursor-pointer">
                        <Info className="w-4 h-4" stroke="currentColor" style={{ color: "#9ca3af" }} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="start">
                      步行距離
                      <ul className="pl-2 space-y-1">
                        <li>• 附近吃: 距離 0.5 公里以內</li>
                        <li>• 走一小段: 距離 1 公里以內</li>
                        <li>• 不想上班: 距離 2 公里以內</li>
                      </ul>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant={radius === 0.5 ? 'default' : 'outline'}
                  className={radius === 0.5 ? 'theme-button' : 'theme-button-outline'}
                  onClick={() => setRadius(0.5)}
                >附近吃</Button>
                <Button
                  type="button"
                  variant={radius === 1 ? 'default' : 'outline'}
                  className={radius === 1 ? 'theme-button' : 'theme-button-outline'}
                  onClick={() => setRadius(1)}
                >走一小段</Button>
                <Button
                  type="button"
                  variant={radius === 2 ? 'default' : 'outline'}
                  className={radius === 2 ? 'theme-button' : 'theme-button-outline'}
                  onClick={() => setRadius(2)}
                >不想上班</Button>
              </div>
            </div>

            <Button
              onClick={handleSelectRestaurant}
              disabled={!peopleCount || isRaining === '' || loading}
              className="w-full theme-button"
            >
              <Dice6 className="w-4 h-4 mr-2" />
              {loading ? '抽選中...' : '抽選午餐店家'}
            </Button>
          </CardContent>
        </Card>

        {/* 天氣資訊 */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {weatherData && getWeatherIcon(weatherData.weather)}
              天氣資訊
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weatherData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">星期</span>
                  <span>星期{weatherData.dayOfWeek}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-300">地區</span>
                  <span>新北市板橋區</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">天氣</span>
                  <span>{weatherData.weather}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">溫度</span>
                  <span>{weatherData.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">體感溫度</span>
                  <span>
                    {typeof weatherData.temperature === 'number' && typeof weatherData.relativeHumidity === 'number' ?
                      `${calcHeatIndex(weatherData.temperature, weatherData.relativeHumidity)}°C` : "—"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  <span className="text-gray-500 text-sm">載入天氣資訊中...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 今日笑話 */}
      <Card className="theme-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Laugh className="w-5 h-5" />
                今日笑話
              </h3>
              <p className="text-sm sm:text-base text-gray-600">{currentJoke}</p>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
              <img
                src={
                  theme === "synology"
                    ? "/images/svs.png"
                    : theme === "hakka"
                      ? "/images/hakka.png"
                      : "/images/mario-hero.png"
                }
                alt={
                  theme === "synology"
                    ? "Synology"
                    : theme === "hakka"
                      ? "Hakka"
                      : "Mario"
                }
                className="w-48 h-24 sm:w-40 sm:h-20 object-contain mario-joke-image"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 股票價格 */}
      <Card className="theme-card">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            即時股價
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {stockData.map((stock) => {
              const isPositive = stock.changePercent !== '--' && parseFloat(stock.changePercent) > 0
              const isNegative = stock.changePercent !== '--' && parseFloat(stock.changePercent) < 0
              const isUnchanged = stock.changePercent === '--' || parseFloat(stock.changePercent) === 0

              return (
                <div key={stock.id} className="border rounded-lg p-2 sm:p-3 space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{stock.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{stock.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{stock.price}</span>
                    <div className="flex items-center gap-1">
                      {isPositive && <TrendingUp className="w-4 h-4 text-red-600" />}
                      {isNegative && <TrendingDown className="w-4 h-4 text-green-600" />}
                      <span className={`text-sm font-medium ${isPositive ? 'text-red-600' :
                          isNegative ? 'text-green-600' :
                            'text-gray-600'
                        }`}>
                        {stock.changePercent !== '--' ? `${stock.changePercent}%` : '--'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>成交量: {parseInt(stock.volume).toLocaleString()}</span>
                    <span className={`${isPositive ? 'text-red-600' :
                        isNegative ? 'text-green-600' :
                          'text-gray-600'
                      }`}>
                      {stock.priceChange !== '--' ? `${parseFloat(stock.priceChange) > 0 ? '+' : ''}${stock.priceChange}` : '--'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 確認對話框 */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => {
        if (!open) {
          setShowConfirmDialog(false)
          setSelectedResult(null)
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dice6 className="w-5 h-5" />
              確認選擇結果
            </DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-6">
              {/* 餐廳資訊 */}
              <Card className="theme-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="w-5 h-5" />
                    {selectedResult.restaurant.name}
                    <Badge variant="secondary">{selectedResult.restaurant.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{selectedResult.restaurant.phone || '無電話資訊'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>建議人數: {selectedResult.restaurant.suggestedPeople}人</span>
                  </div>
                  {selectedResult.restaurant.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedResult.restaurant.address}</span>
                    </div>
                  )}
                  {selectedResult.restaurant.distance && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>距離: {selectedResult.restaurant.distance}公里</span>
                    </div>
                  )}
                </CardContent>
              </Card>



              <div className="flex gap-2">
                <Button onClick={handleConfirmSelection} className="flex-1 theme-button">
                  確認選擇
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReselectRestaurant}
                  disabled={loading}
                  className="flex-1 theme-button-outline"
                >
                  {loading ? '重新抽選中...' : '重新抽取'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setSelectedResult(null)
                  }}
                  className="flex-1 theme-button-outline"
                >
                  取消
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
