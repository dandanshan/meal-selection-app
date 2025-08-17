'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Utensils, History, Settings, Palette } from 'lucide-react'
import { ThemeProvider, useTheme } from '@/components/ThemeProvider'
import SelectionPage from '@/components/SelectionPage'
import HistoryPage from '@/components/HistoryPage'
import RestaurantManagementPage from '@/components/RestaurantManagementPage'
import { Toaster } from '@/components/ui/toaster'

function HomePageContent() {
  const [activeTab, setActiveTab] = useState('selection')
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen">
      {/* 標題 Banner - 滿版寬度 */}
      <div className="w-full theme-banner py-4 sm:py-6 mb-4 sm:mb-6">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            {theme === 'mario' && (
              <img 
                src="/images/mario-mushroom.png" 
                alt="Mario Mushroom" 
                className="w-6 h-6 sm:w-8 sm:h-8 mario-mushroom-decoration"
              />
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-center">亞東美食沙漠之今天吃什麼</h1>
            {theme === 'mario' && (
              <img 
                src="/images/mario-mushroom.png" 
                alt="Mario Mushroom" 
                className="w-6 h-6 sm:w-8 sm:h-8 mario-mushroom-decoration"
              />
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* 主題選取選單 - 浮動在右下角 */}
        <div className="fixed bottom-4 right-4 z-50">
          <Select value={theme} onValueChange={(value: "mario" | "synology" | "hakka") => setTheme(value)}>
            <SelectTrigger className="theme-selector-trigger border-0 bg-transparent w-[120px] sm:w-[140px] shadow-lg rounded-md">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mario">Mario</SelectItem>
              <SelectItem value="synology">Synology</SelectItem>
              <SelectItem value="hakka">Hakka</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 bg-gray-100/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 h-auto min-h-[44px] gap-1">
            <TabsTrigger 
              value="selection" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:scale-105 hover:scale-105 rounded-lg py-2 h-full"
            >
              <Utensils className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">抽選午餐</span>
              <span className="sm:hidden">抽選</span>
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:scale-105 hover:scale-105 rounded-lg py-2 h-full"
            >
              <History className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">歷史記錄</span>
              <span className="sm:hidden">歷史</span>
            </TabsTrigger>
            <TabsTrigger 
              value="management" 
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md data-[state=active]:scale-105 hover:scale-105 rounded-lg py-2 h-full"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">店家管理</span>
              <span className="sm:hidden">管理</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="selection" className="space-y-4 sm:space-y-6">
            <SelectionPage />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <HistoryPage />
          </TabsContent>

          <TabsContent value="management" className="space-y-4 sm:space-y-6">
            <RestaurantManagementPage />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Toast 通知 */}
      <Toaster />
    </div>
  )
}

export default function HomePage() {
  return <HomePageContent />
}
