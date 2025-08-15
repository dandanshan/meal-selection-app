'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'mario' | 'synology'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('mario')

  useEffect(() => {
    // 從 localStorage 讀取主題設定
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && (savedTheme === 'mario' || savedTheme === 'synology')) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // 儲存主題設定到 localStorage
    localStorage.setItem('theme', theme)
    
    // 更新 body 的 class
    document.body.className = document.body.className.replace(/mario-theme|synology-theme/g, '')
    document.body.classList.add(`${theme}-theme`)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
