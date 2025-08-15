"use client"

import type React from "react"

import { createContext, useContext } from "react"

interface ThemeContextType {
  theme: "mario" | "synology"
}

const ThemeContext = createContext<ThemeContextType>({ theme: "mario" })

export const useTheme = () => useContext(ThemeContext)

interface ThemeProviderProps {
  theme: "mario" | "synology"
  children: React.ReactNode
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}
