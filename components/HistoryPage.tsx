'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Eye, Upload, X, Phone, MapPin, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// --- 新增付款人選單元件（shadcn/ui Select 版） ---
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
function PayerSelect({ payerName, setPayerName }: { payerName: string, setPayerName: (name: string) => void }) {
  const [colleagues, setColleagues] = useState<{ id: string, name: string }[]>([]);
  const [showOther, setShowOther] = useState(false);
  useEffect(() => {
    fetch('/api/colleagues')
      .then(res => res.json())
      .then(data => setColleagues(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!colleagues.length) return;
    if (colleagues.find(c => c.name === payerName)) {
      setShowOther(false);
    } else if (payerName) {
      setShowOther(true);
    }
  }, [payerName, colleagues]);

  return (
    <div className="space-y-2">
      <Select
        value={showOther ? '其他' : payerName}
        onValueChange={(value) => {
          if (value === '其他') {
            setShowOther(true);
            setPayerName('');
          } else {
            setShowOther(false);
            setPayerName(value);
          }
        }}
      >
        <SelectTrigger className="w-full h-10 text-sm">
          <SelectValue placeholder="請選擇付款人" />
        </SelectTrigger>
        <SelectContent>
          {colleagues.map((c) => (
            <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
          ))}
          <SelectItem value="其他">其他</SelectItem>
        </SelectContent>
      </Select>
      {showOther && (
        <Input
          placeholder="請輸入付款人姓名"
          value={payerName}
          onChange={e => setPayerName(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}
// --- end ---

interface Restaurant {
  id: string
  name: string
  type: string
  suggestedPeople: number
  phone?: string
  address?: string
  distance?: number
}

interface Payment {
  id: string
  payerName?: string
  amount?: number
  receiptImage?: string
}

interface History {
  id: string
  date: string
  restaurant: Restaurant
  peopleCount: number
  weather: string
  isRaining: boolean
  confirmed: boolean
  payment?: Payment
}

export default function HistoryPage() {
  const [history, setHistory] = useState<History[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPayment, setEditingPayment] = useState<string | null>(null)
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null)
  const [showClearAllDialog, setShowClearAllDialog] = useState(false)
  const { toast } = useToast()
  const [editPaymentForm, setEditPaymentForm] = useState({
    amount: '' as number | '',
    payerName: '',
    receiptImage: null as string | null,
  })

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      setHistory(data)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' })
      setHistory([])
      setShowClearAllDialog(false)
      toast({
        title: "歷史記錄已清除",
        description: "所有歷史記錄已成功清除",
      })
    } catch (error) {
      console.error('Error clearing history:', error)
      toast({
        title: "清除失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    }
  }

  const deleteSingleHistory = async (historyId: string) => {
    try {
      const response = await fetch(`/api/history/${historyId}`, { 
        method: 'DELETE' 
      })
      
      if (!response.ok) {
        throw new Error('刪除失敗')
      }

      // 從本地狀態中移除該記錄
      setHistory(history.filter(record => record.id !== historyId))
      setDeletingHistoryId(null)
      
      toast({
        title: "記錄已刪除",
        description: "歷史記錄已成功刪除",
      })
    } catch (error) {
      console.error('Error deleting history:', error)
      toast({
        title: "刪除失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    }
  }

  const editPaymentInfo = (historyId: string) => {
    const record = history.find((h) => h.id === historyId)
    if (record) {
      setEditingPayment(historyId)
      setEditPaymentForm({
        amount: record.payment?.amount || '',
        payerName: record.payment?.payerName || '',
        receiptImage: record.payment?.receiptImage || null,
      })
    }
  }

  const savePaymentInfo = async () => {
    if (!editingPayment) return

    try {
      await fetch('/api/payment', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          historyId: editingPayment,
          payerName: editPaymentForm.payerName,
          amount: editPaymentForm.amount,
          receiptImage: editPaymentForm.receiptImage,
        })
      })

      // 更新本地狀態
      setHistory(prev => prev.map(record => {
        if (record.id === editingPayment) {
          return {
            ...record,
            payment: {
              id: record.payment?.id || '',
              payerName: editPaymentForm.payerName,
              amount: editPaymentForm.amount || undefined,
              receiptImage: editPaymentForm.receiptImage || undefined,
            }
          }
        }
        return record
      }))

      setEditingPayment(null)
      setEditPaymentForm({
        amount: '',
        payerName: '',
        receiptImage: null,
      })
      toast({
        title: "付款資訊已更新",
        description: "付款資訊已成功保存",
      })
    } catch (error) {
      console.error('Error saving payment info:', error)
      toast({
        title: "更新失敗",
        description: "請稍後再試",
        variant: "destructive",
      })
    }
  }

  const handleEditImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditPaymentForm({
          ...editPaymentForm,
          receiptImage: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold theme-title">選擇歷史</h2>
        <Button 
          className="theme-button w-full sm:w-auto" 
          onClick={() => setShowClearAllDialog(true)}
          disabled={history.length === 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          清除歷史
        </Button>
      </div>

      {history.length === 0 ? (
        <Card className="theme-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            暫無歷史記錄
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6">
          {history.map((record) => (
            <Card key={record.id} className="theme-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{record.restaurant.name}</h3>
                    <Badge variant="secondary">{new Date(record.date).toLocaleDateString()}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingHistoryId(record.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 text-sm">
                    <p>
                      <strong>類型:</strong> {record.restaurant.type}
                    </p>
                    <p>
                      <strong>用餐人數:</strong> {record.peopleCount}人
                    </p>
                    <p>
                      <strong>餐廳建議人數:</strong> {record.restaurant.suggestedPeople}
                    </p>
                    <p>
                      <strong>天氣:</strong> {record.weather}
                    </p>
                    <p>
                      <strong>下雨:</strong> {record.isRaining ? "是" : "否"}
                    </p>
                  </div>
                  <div className="space-y-4">
                    {record.payment ? (
                      <div className="space-y-3 text-sm">
                        <p>
                          <strong>金額:</strong> NT${record.payment.amount}
                        </p>
                        <p>
                          <strong>付款人:</strong> {record.payment.payerName}
                        </p>
                        {record.payment.receiptImage && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                查看收據
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>收據照片</DialogTitle>
                              </DialogHeader>
                              <div className="pt-2">
                                <img
                                  src={record.payment.receiptImage}
                                  alt="Receipt"
                                  className="w-full h-auto max-h-96 object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">尚未填寫付款資訊</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editPaymentInfo(record.id)}
                      className="w-full"
                    >
                      {record.payment ? "編輯付款資訊" : "新增付款資訊"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 編輯付款資訊對話框 */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>編輯付款資訊</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-amount" className="mb-3 block">金額</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  placeholder="金額"
                  value={editPaymentForm.amount}
                  onChange={(e) =>
                    setEditPaymentForm({
                      ...editPaymentForm,
                      amount: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-payer" className="mb-3 block">付款人</Label>
                <PayerSelect
                  payerName={editPaymentForm.payerName}
                  setPayerName={(name: string) => setEditPaymentForm({ ...editPaymentForm, payerName: name })}
                />
              </div>
            </div>

            <div>
                              <Label className="mb-3 block">收據照片</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="hidden"
                  id="edit-receipt"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('edit-receipt')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上傳收據
                </Button>
                {editPaymentForm.receiptImage && (
                  <div className="flex items-center gap-2">
                    <img
                      src={editPaymentForm.receiptImage}
                      alt="Receipt"
                      className="w-8 h-8 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setEditPaymentForm({
                          ...editPaymentForm,
                          receiptImage: null,
                        })
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={savePaymentInfo} className="flex-1 theme-button">
                保存
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingPayment(null)}
                className="flex-1 theme-button-outline"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 清除所有歷史記錄確認對話框 */}
      <Dialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>確認清除所有歷史記錄</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              確定要清除所有歷史記錄嗎？此操作無法復原。
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={clearHistory} 
                className="flex-1 theme-button"
                variant="destructive"
              >
                確定清除
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowClearAllDialog(false)}
                className="flex-1 theme-button-outline"
              >
                取消
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 刪除單一歷史記錄確認對話框 */}
      <Dialog open={!!deletingHistoryId} onOpenChange={() => setDeletingHistoryId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>確認刪除歷史記錄</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              確定要刪除這筆歷史記錄嗎？此操作無法復原。
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => deletingHistoryId && deleteSingleHistory(deletingHistoryId)} 
                className="flex-1 theme-button"
                variant="destructive"
              >
                確定刪除
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeletingHistoryId(null)}
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
