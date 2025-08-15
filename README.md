# 🍽️ 智能餐廳選擇系統

一個基於天氣條件和個人偏好的智能餐廳推薦系統，幫助您輕鬆選擇適合的用餐地點。

## ✨ 功能特色

### 🎯 智能餐廳選擇
- **天氣條件篩選**: 根據溫度、降雨狀況自動篩選適合的餐廳
- **人數匹配**: 根據用餐人數推薦合適的餐廳
- **營業日檢查**: 自動檢查餐廳是否在當天營業
- **歷史記錄**: 避免重複選擇本週已去過的餐廳

### 🌤️ 即時天氣資訊
- **板橋測站資料**: 使用中央氣象局板橋測站的即時天氣資料
- **溫度篩選**: 
  - 高於 28°C: 排除不適合夏天的餐廳
  - 低於 18°C: 排除不適合冬天的餐廳
- **降雨篩選**: 下雨時自動排除不適合雨天的餐廳

### 📊 即時資訊顯示
- **天氣資訊**: 溫度、天氣狀況、星期、地區
- **股票資訊**: 即時股價顯示（台積電、聯發科等）
- **今日笑話**: 隨機笑話增添樂趣

### 🏪 餐廳管理
- **新增餐廳**: 完整的餐廳資訊管理
- **編輯餐廳**: 修改餐廳資料
- **刪除餐廳**: 移除不需要的餐廳
- **天氣適宜性**: 設定餐廳的天氣限制條件

### 📝 歷史記錄
- **選擇記錄**: 記錄每次的餐廳選擇
- **付款資訊**: 記錄用餐金額和付款人
- **收據上傳**: 支援收據照片上傳
- **記錄管理**: 查看、編輯、刪除歷史記錄

### 🎨 主題設計
- **Mario 主題**: 經典遊戲風格設計
- **Synology 主題**: 現代簡潔風格設計
- **響應式設計**: 支援手機和桌面瀏覽

## 🚀 快速開始

### 環境需求
- Node.js 18+ 
- npm 或 pnpm
- SQLite (內建)

### 安裝步驟

1. **克隆專案**
```bash
git clone [您的 GitHub 倉庫 URL]
cd meal-selection-app
```

2. **安裝依賴**
```bash
npm install
# 或使用 pnpm
pnpm install
```

3. **設置環境變數**
```bash
# 創建 .env.local 檔案
echo 'DATABASE_URL="file:./dev.db"' > .env.local
```

4. **初始化資料庫**
```bash
npx prisma db push
```

5. **啟動開發伺服器**
```bash
npm run dev
# 或使用 pnpm
pnpm dev
```

6. **開啟瀏覽器**
訪問 [http://localhost:3000](http://localhost:3000)

## 📁 專案結構

```
meal-selection-app/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── history/       # 歷史記錄 API
│   │   ├── restaurants/   # 餐廳管理 API
│   │   ├── select/        # 餐廳選擇 API
│   │   ├── weather/       # 天氣 API
│   │   └── stocks/        # 股票 API
│   ├── globals.css        # 全域樣式
│   ├── layout.tsx         # 根佈局
│   └── page.tsx           # 主頁面
├── components/            # React 組件
│   ├── ui/               # UI 組件庫
│   ├── SelectionPage.tsx # 餐廳選擇頁面
│   ├── HistoryPage.tsx   # 歷史記錄頁面
│   └── RestaurantManagementPage.tsx # 餐廳管理頁面
├── lib/                  # 工具函數
│   ├── prisma.ts         # Prisma 客戶端
│   ├── weather.ts        # 天氣資料處理
│   └── utils.ts          # 通用工具函數
├── prisma/               # 資料庫
│   └── schema.prisma     # 資料庫結構
└── public/               # 靜態資源
    └── images/           # 圖片檔案
```

## 🛠️ 技術棧

- **前端框架**: Next.js 15 + React 19
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **UI 組件**: Shadcn UI
- **資料庫**: SQLite + Prisma ORM
- **圖標**: Lucide React
- **狀態管理**: React Hooks
- **API**: Next.js API Routes

## 📱 使用指南

### 餐廳選擇
1. 輸入用餐人數
2. 選擇是否下雨
3. 系統會自動獲取天氣資訊
4. 點擊「開始抽選」按鈕
5. 確認選擇結果並記錄

### 餐廳管理
1. 點擊「店家管理」標籤
2. 使用「新增餐廳」按鈕添加新餐廳
3. 填寫餐廳資訊（名稱、類型、建議人數等）
4. 設定天氣適宜性條件
5. 使用編輯或刪除按鈕管理餐廳

### 歷史記錄
1. 點擊「歷史記錄」標籤
2. 查看過去的餐廳選擇記錄
3. 編輯付款資訊或上傳收據
4. 刪除不需要的記錄

## 🔧 自定義設定

### 天氣 API
修改 `lib/weather.ts` 中的測站 ID：
```typescript
// 目前使用板橋測站 (C0AJ80)
const response = await axios.get(
  'https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001?Authorization=YOUR_API_KEY&format=JSON&StationId=C0AJ80'
)
```

### 股票 API
修改 `app/api/stocks/route.ts` 中的股票代碼：
```typescript
// 目前顯示的股票
const stocks = ['tse_0050.tw', 'tse_2330.tw', 'tse_2317.tw', 'tse_1216.tw', 'otc_6547.tw', 'otc_6180.tw']
```

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案！

## 📄 授權

MIT License

## 🙏 致謝

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn UI](https://ui.shadcn.com/) - UI 組件庫
- [Prisma](https://www.prisma.io/) - 資料庫 ORM
- [中央氣象局](https://www.cwb.gov.tw/) - 天氣資料
- [台灣證券交易所](https://www.twse.com.tw/) - 股票資料
