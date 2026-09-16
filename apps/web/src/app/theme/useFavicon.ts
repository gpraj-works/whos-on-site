import { useEffect } from 'react'
import { ThemeColorType } from '@whosonsite/shared'
import { getLogoSvgString } from '../../components/common/Logo'

const SWATCH_HEX_MAP: Record<ThemeColorType, string> = {
  teal: '#12b886',
  indigo: '#4c6ef5',
  blue: '#228be6',
  violet: '#7950f2',
  orange: '#fd7e14',
  green: '#40c057'
}

/**
 * Dynamically updates document favicon SVG matching current theme primary color & mode.
 */
export function useFavicon(primaryColor: ThemeColorType, colorScheme: 'light' | 'dark') {
  useEffect(() => {
    const hexColor = SWATCH_HEX_MAP[primaryColor] || '#12b886'
    const svgString = getLogoSvgString(hexColor)
    // Removed legacy ;utf8 part from the data URI
    const encodedSvg = `data:image/svg+xml,${encodeURIComponent(svgString)}`

    // Recreate the link element to force the browser to update the favicon
    let faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null
    if (faviconLink) {
      faviconLink.remove()
    }
    
    faviconLink = document.createElement('link')
    faviconLink.id = 'dynamic-favicon'
    faviconLink.rel = 'icon'
    faviconLink.type = 'image/svg+xml'
    faviconLink.href = encodedSvg
    
    document.head.appendChild(faviconLink)
  }, [primaryColor, colorScheme])
}
