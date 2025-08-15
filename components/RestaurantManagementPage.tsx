'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Toggle } from '@/components/ui/toggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit, Trash2, Plus, Phone, MapPin, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Restaurant {
  id: string
  name: string
  type: string
  suggestedPeople: string
  phone?: string
  address?: string
  businessDays: string
  notSuitableForSummer: boolean
  notSuitableForWinter: boolean
  notSuitableForRainy: boolean
  distance?: number
}

const restaurantTypes = [
  '中式', '日式', '美式', '義式', '韓式', '泰式', '越式', '台式', '素食', '火鍋', '燒烤', '其他'
]

const peopleOptions = [
  { value: '1-4', label: '1-4人' },
  { value: '5-8', label: '5-8人' },
  { value: '9+', label: '9人以上' }
]

const dayNames = [
  { value: 'monday', label: '週一' },
  { value: 'tuesday', label: '週二' },
  { value: 'wednesday', label: '週三' },
  { value: 'thursday', label: '週四' },
  { value: 'friday', label: '週五' },
  { value: 'saturday', label: '週六' },
  { value: 'sunday', label: '週日' }
]

export default function RestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletingRestaurantId, setDeletingRestaurantId] = useState<string | null>(null)
  const { toast } = useToast()
  const [restaurantForm, setRestaurantForm] = useState({
    name: '',
    type: '',
    suggestedPeople: '' as string,
    phone: '',
    address: '',
    businessDays: [] as string[],
    notSuitableForSummer: false,
    notSuitableForWinter: false,
    notSuitableForRainy: false,
    distance: undefined as number | undefined
  })

  useEffect(() => {
    fetchRestaurants()
  }, [])

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      setRestaurants(data)
    } catch (error) {
      console.error('Error fetching restaurants:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setRestaurantForm({
      name: '',
      type: '',
      suggestedPeople: '',
      phone: '',
      address: '',
      businessDays: [],
      notSuitableForSummer: false,
      notSuitableForWinter: false,
      notSuitableForRainy: false,
      distance: undefined
    })
    setEditingRestaurant(null)
    setIsEditDialogOpen(false)
    setIsAddDialogOpen(false)
  }

  const closeAddDialog = () => {
    setIsAddDialogOpen(false)
    // 重置表單為空值
    setRestaurantForm({
      name: '',
      type: '',
      suggestedPeople: '',
      phone: '',
      address: '',
      businessDays: [],
      notSuitableForSummer: false,
      notSuitableForWinter: false,
      notSuitableForRainy: false,
      distance: undefined
    })
  }

  const saveRestaurant = async () => {
    if (!restaurantForm.name || !restaurantForm.type || !restaurantForm.suggestedPeople) {
      toast({
        title: "請填寫必要資訊",
        description: "請填寫餐廳名稱、類型和建議人數",
        variant: "destructive",
      })
      return
    }

    try {
      const url = editingRestaurant 
        ? `/api/restaurants/${editingRestaurant.id}`
        : '/api/restaurants'
      
      const method = editingRestaurant ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(restaurantForm)
      })

      if (!response.ok) {
        throw new Error('儲存失敗')
      }

      await fetchRestaurants()
      
      if (editingRestaurant) {
        // 編輯模式：重置表單並關閉編輯視窗
        resetForm()
      } else {
        // 新增模式：只關閉新增視窗，不重置表單
        setIsAddDialogOpen(false)
      }
      
      toast({
        title: editingRestaurant ? "餐廳已更新" : "餐廳已新增",
        description: editingRestaurant ? "餐廳資訊已成功更新" : "新餐廳已成功新增",
      })
    } catch (error) {
      console.error('Error saving restaurant:', error)
      toast({
        title: "儲存失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    }
  }

  const editRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    
    setRestaurantForm({
      name: restaurant.name,
      type: restaurant.type,
      suggestedPeople: restaurant.suggestedPeople,
      phone: restaurant.phone || '',
      address: restaurant.address || '',
      businessDays: JSON.parse(restaurant.businessDays),
      notSuitableForSummer: restaurant.notSuitableForSummer,
      notSuitableForWinter: restaurant.notSuitableForWinter,
      notSuitableForRainy: restaurant.notSuitableForRainy,
      distance: restaurant.distance
    })
    setIsEditDialogOpen(true)
  }

  const deleteRestaurant = async (id: string) => {
    try {
      const response = await fetch(`/api/restaurants/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('刪除失敗')
      }

      await fetchRestaurants()
      toast({
        title: "餐廳已刪除",
        description: "餐廳已成功從列表中移除",
      })
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      toast({
        title: "刪除失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleBusinessDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setRestaurantForm({
        ...restaurantForm,
        businessDays: [...restaurantForm.businessDays, day]
      })
    } else {
      setRestaurantForm({
        ...restaurantForm,
        businessDays: restaurantForm.businessDays.filter(d => d !== day)
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>載入中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 新增餐廳按鈕 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold theme-title">餐廳管理</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          if (!open) {
            // 關閉對話框時重置表單
            setRestaurantForm({
              name: '',
              type: '',
              suggestedPeople: '',
              phone: '',
              address: '',
              businessDays: [],
              notSuitableForSummer: false,
              notSuitableForWinter: false,
              notSuitableForRainy: false,
              distance: undefined
            })
            setEditingRestaurant(null)
          }
          setIsAddDialogOpen(open)
        }}>
          <DialogTrigger asChild>
            <Button className="theme-button w-full sm:w-auto" onClick={() => {
              // 重置表單為空值
              setRestaurantForm({
                name: '',
                type: '',
                suggestedPeople: '',
                phone: '',
                address: '',
                businessDays: [],
                notSuitableForSummer: false,
                notSuitableForWinter: false,
                notSuitableForRainy: false,
                distance: undefined
              })
              setEditingRestaurant(null)
              setIsAddDialogOpen(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              新增餐廳
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增餐廳</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="add-name" className="mb-3 block">餐廳名稱 *</Label>
                  <Input
                    id="add-name"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                    placeholder="請輸入餐廳名稱"
                  />
                </div>
                <div>
                  <Label htmlFor="add-type" className="mb-3 block">餐廳類型 *</Label>
                  <Select value={restaurantForm.type} onValueChange={(value) => setRestaurantForm({ ...restaurantForm, type: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇餐廳類型" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurantTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="add-people" className="mb-3 block">建議人數 *</Label>
                  <Select value={restaurantForm.suggestedPeople} onValueChange={(value) => setRestaurantForm({ ...restaurantForm, suggestedPeople: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇建議人數" />
                    </SelectTrigger>
                    <SelectContent>
                      {peopleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="add-phone" className="mb-3 block">電話</Label>
                  <Input
                    id="add-phone"
                    value={restaurantForm.phone}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                    placeholder="請輸入電話號碼"
                  />
                </div>
              </div>



              <div>
                <Label className="mb-3 block">營業日</Label>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  {dayNames.map((day) => (
                    <Toggle
                      key={day.value}
                      pressed={restaurantForm.businessDays.includes(day.value)}
                      onPressedChange={(pressed) => handleBusinessDayChange(day.value, pressed)}
                      className="justify-center px-1 sm:px-2 py-1 text-xs sm:text-sm"
                      variant="outline"
                    >
                      {day.label}
                    </Toggle>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="add-address" className="mb-3 block">地址</Label>
                <Textarea
                  id="add-address"
                  value={restaurantForm.address}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                  placeholder="請輸入地址"
                />
              </div>

              <div>
                <Label className="mb-3 block">天氣適宜性</Label>
                <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                  <Toggle
                    pressed={restaurantForm.notSuitableForSummer}
                    onPressedChange={(pressed) => setRestaurantForm({ ...restaurantForm, notSuitableForSummer: pressed })}
                    className="justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm"
                    variant="outline"
                  >
                    不適合夏天
                  </Toggle>
                  <Toggle
                    pressed={restaurantForm.notSuitableForWinter}
                    onPressedChange={(pressed) => setRestaurantForm({ ...restaurantForm, notSuitableForWinter: pressed })}
                    className="justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm"
                    variant="outline"
                  >
                    不適合冬天
                  </Toggle>
                  <Toggle
                    pressed={restaurantForm.notSuitableForRainy}
                    onPressedChange={(pressed) => setRestaurantForm({ ...restaurantForm, notSuitableForRainy: pressed })}
                    className="justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm"
                    variant="outline"
                  >
                    不適合雨天
                  </Toggle>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveRestaurant} className="theme-button">
                  新增
                </Button>
                <Button variant="outline" onClick={closeAddDialog} className="theme-button-outline">
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 餐廳列表 */}
      <Card className="theme-card">
        <CardContent className="p-6">
          {restaurants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">暫無餐廳資料</p>
          ) : (
            <div className="grid gap-6">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="border rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
                    <div className="space-y-4 sm:space-y-5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                        <Badge variant="secondary">{restaurant.type}</Badge>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>建議人數: {restaurant.suggestedPeople}</span>
                        </div>
                        {restaurant.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{restaurant.phone}</span>
                          </div>
                        )}
                        {restaurant.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{restaurant.address}</span>
                          </div>
                        )}

                        {restaurant.distance && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>距離: {restaurant.distance}公里</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(restaurant.businessDays).map((day: string) => (
                          <Badge key={day} variant="outline" className="text-xs">
                            {dayNames.find(d => d.value === day)?.label}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.notSuitableForSummer && (
                          <Badge variant="secondary" className="text-xs bg-orange-50 text-orange-700 border-orange-200">不適合夏天</Badge>
                        )}
                        {restaurant.notSuitableForWinter && (
                          <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">不適合冬天</Badge>
                        )}
                        {restaurant.notSuitableForRainy && (
                          <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-700 border-gray-200">不適合雨天</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 sm:ml-6 w-full sm:w-auto">
                      <Dialog open={isEditDialogOpen && editingRestaurant?.id === restaurant.id} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editRestaurant(restaurant)}
                            className="flex-1 sm:flex-none p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>編輯餐廳</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                              <div>
                                <Label htmlFor="edit-name" className="mb-3 block">餐廳名稱 *</Label>
                                <Input
                                  id="edit-name"
                                  value={restaurantForm.name}
                                  onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                                  placeholder="請輸入餐廳名稱"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-type" className="mb-3 block">餐廳類型 *</Label>
                                <Select value={restaurantForm.type} onValueChange={(value) => setRestaurantForm({ ...restaurantForm, type: value })}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="選擇餐廳類型" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {restaurantTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                              <div>
                                <Label htmlFor="edit-people" className="mb-3 block">建議人數 *</Label>
                                <Select value={restaurantForm.suggestedPeople} onValueChange={(value) => setRestaurantForm({ ...restaurantForm, suggestedPeople: value })}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="選擇建議人數" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {peopleOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="edit-phone" className="mb-3 block">電話</Label>
                                <Input
                                  id="edit-phone"
                                  value={restaurantForm.phone}
                                  onChange={(e) => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
                                  placeholder="請輸入電話號碼"
                                />
                              </div>
                            </div>



                            <div>
                              <Label className="mb-3 block">營業日</Label>
                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                {dayNames.map((day) => (
                                  <Toggle
                                    key={day.value}
                                    pressed={restaurantForm.businessDays.includes(day.value)}
                                    onPressedChange={(pressed) => handleBusinessDayChange(day.value, pressed)}
                                    className="justify-center px-1 sm:px-2 py-1 text-xs sm:text-sm"
                                    variant="outline"
                                  >
                                    {day.label}
                                  </Toggle>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="edit-address" className="mb-3 block">地址</Label>
                              <Textarea
                                id="edit-address"
                                value={restaurantForm.address}
                                onChange={(e) => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
                                placeholder="請輸入地址"
                              />
                            </div>

                            <div>
                              <Label className="mb-3 block">天氣適宜性</Label>
                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                <Toggle
                                  pressed={restaurantForm.notSuitableForSummer}
                                  onPressedChange={(pressed) => setRestaurantForm({ ...restaurantForm, notSuitableForSummer: pressed })}
                                  className="justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm"
                                  variant="outline"
                                >
                                  不適合夏天
                                </Toggle>
                                <Toggle
                                  pressed={restaurantForm.notSuitableForWinter}
                                  onPressedChange={(pressed) => setRestaurantForm({ ...restaurantForm, notSuitableForWinter: pressed })}
                                  className="justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm"
                                  variant="outline"
                                >
                                  不適合冬天
                                </Toggle>
                                <Toggle
                                  pressed={restaurantForm.notSuitableForRainy}
                                  onPressedChange={(pressed) => setRestaurantForm({ ...restaurantForm, notSuitableForRainy: pressed })}
                                  className="justify-center px-2 sm:px-3 py-1 text-xs sm:text-sm"
                                  variant="outline"
                                >
                                  不適合雨天
                                </Toggle>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button onClick={saveRestaurant} className="theme-button">
                                更新
                              </Button>
                              <Button variant="outline" onClick={resetForm} className="theme-button-outline">
                                取消
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white flex-1 sm:flex-none p-2"
                        onClick={() => setDeletingRestaurantId(restaurant.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除餐廳確認對話框 */}
      <Dialog open={!!deletingRestaurantId} onOpenChange={() => setDeletingRestaurantId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>確認刪除餐廳</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              確定要刪除這家餐廳嗎？此操作無法復原。
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  if (deletingRestaurantId) {
                    deleteRestaurant(deletingRestaurantId)
                    setDeletingRestaurantId(null)
                  }
                }} 
                className="flex-1 theme-button"
                variant="destructive"
              >
                確定刪除
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeletingRestaurantId(null)}
                className="flex-1 theme-button-outline"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
