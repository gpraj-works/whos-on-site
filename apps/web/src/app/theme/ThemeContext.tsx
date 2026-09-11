import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { THEME_COLORS, ThemeColorType } from '@routeboard/shared'

import { getAppTheme } from './index'
import { useFavicon } from './useFavicon'

type ColorScheme = 'light' | 'dark'

interface ThemeContextType {
  colorScheme: ColorScheme
  toggleColorScheme: () => void
  setColorScheme: (scheme: ColorScheme) => void
  primaryColor: ThemeColorType
  setPrimaryColor: (color: ThemeColorType) => void
  themeColors: readonly ThemeColorType[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'routeboard_color_scheme'

export const ThemeProvider: React.FC<{
  initialCompanyColor?: ThemeColorType
  children: React.ReactNode
}> = ({ initialCompanyColor = 'teal', children }) => {
  // 1. User Theme Preference (Light / Dark) -> Persisted in localStorage
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved === 'dark' || saved === 'light') {
        return saved
      }
    } catch {
      // Ignore storage errors
    }
    return 'light'
  })

  const toggleColorScheme = () => {
    setColorSchemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme)
  }

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, colorScheme)
    } catch {
      // Ignore storage errors
    }
  }, [colorScheme])

  // 2. Company Primary Color Swatch (Server-owned per tenant, default teal)
  const [primaryColor, setPrimaryColor] = useState<ThemeColorType>(initialCompanyColor)

  useEffect(() => {
    setPrimaryColor(initialCompanyColor)
  }, [initialCompanyColor])

  // 3. Update dynamic SVG favicon based on theme & accent color
  useFavicon(primaryColor, colorScheme)

  // 4. Memoized Mantine Theme Object
  const theme = useMemo(() => getAppTheme(primaryColor), [primaryColor])

  const contextValue = useMemo(
    () => ({
      colorScheme,
      toggleColorScheme,
      setColorScheme,
      primaryColor,
      setPrimaryColor,
      themeColors: THEME_COLORS
    }),
    [colorScheme, primaryColor]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      <MantineProvider theme={theme} defaultColorScheme={colorScheme} forceColorScheme={colorScheme}>
        <Notifications position="top-right" zIndex={1000} />
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  )
}

export function useAppTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider')
  }
  return context
}
