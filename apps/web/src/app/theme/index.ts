import { createTheme, MantineThemeOverride } from '@mantine/core'
import { ThemeColorType } from '@whosonsite/shared'

export * from './statusColors'
export * from './ThemeContext'

/** Common design tokens across light and dark modes */
export const commonThemeTokens = {
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  defaultRadius: 'md',
  headings: {
    fontFamily: 'Outfit, Inter, system-ui, sans-serif',
    fontWeight: '700'
  }
}

/** Generates Mantine Theme override configured with company primary color */
export function getAppTheme(primaryColor: ThemeColorType = 'teal'): MantineThemeOverride {
  return createTheme({
    fontFamily: commonThemeTokens.fontFamily,
    fontFamilyMonospace: commonThemeTokens.fontFamilyMonospace,
    primaryColor,
    defaultRadius: commonThemeTokens.defaultRadius,

    headings: {
      fontFamily: commonThemeTokens.headings.fontFamily,
      fontWeight: commonThemeTokens.headings.fontWeight
    },

    components: {
      Button: {
        defaultProps: {
          radius: 'md'
        }
      },
      Card: {
        defaultProps: {
          radius: 'md',
          withBorder: true
        }
      },
      Paper: {
        defaultProps: {
          radius: 'md',
          withBorder: true
        }
      },
      Modal: {
        defaultProps: {
          radius: 'lg',
          centered: true
        }
      },
      Badge: {
        defaultProps: {
          radius: 'sm',
          variant: 'light'
        }
      }
    }
  })
}
