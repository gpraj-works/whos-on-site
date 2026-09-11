import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { THEME_COLORS, ThemeColorType } from '@whosonsite/shared'

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

const LOCAL_STORAGE_SCHEME_KEY = 'whosonsite_color_scheme'
const LOCAL_STORAGE_PRIMARY_COLOR_KEY = 'whosonsite_primary_color'

export const ThemeProvider: React.FC<{
  initialCompanyColor?: ThemeColorType
  children: React.ReactNode
}> = ({ initialCompanyColor = 'teal', children }) => {
  // User Theme Preference (Light / Dark) -> Persisted in localStorage
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SCHEME_KEY)
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
      localStorage.setItem(LOCAL_STORAGE_SCHEME_KEY, colorScheme)
    } catch {
      // Ignore storage errors
    }
    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme)
    document.documentElement.style.colorScheme = colorScheme
  }, [colorScheme])

  // Company & User Primary Accent Color Swatch -> Persisted in localStorage
  const [primaryColor, setPrimaryColorState] = useState<ThemeColorType>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PRIMARY_COLOR_KEY) as ThemeColorType
      if (saved && THEME_COLORS.includes(saved)) {
        return saved
      }
    } catch {
      // Ignore storage errors
    }
    return initialCompanyColor
  })

  const setPrimaryColor = (color: ThemeColorType) => {
    setPrimaryColorState(color)
  }

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRIMARY_COLOR_KEY, primaryColor)
    } catch {
      // Ignore storage errors
    }
  }, [primaryColor])

  // Update dynamic SVG favicon based on theme & accent color
  useFavicon(primaryColor, colorScheme)

  // Memoized Mantine Theme Object
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
