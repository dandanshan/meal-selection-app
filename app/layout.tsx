import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "../components/ThemeProvider"
import PetalsFalling from "../components/PetalsFalling"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "亞東美食沙漠之今天吃什麼",
  description: "智能餐廳選擇系統，結合天氣資訊與個人偏好",
  generator: 'v0.dev',
  icons: "/images/favicon.png"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <ThemeProvider>
          <PetalsFalling />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
