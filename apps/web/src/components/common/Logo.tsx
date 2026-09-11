import React from 'react'

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

/**
 * Returns raw SVG XML string formatted for dynamic favicon data URI generation.
 */
export function getLogoSvgString(fillColor: string = '#12b886'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M5 3C5 4.10457 4.10457 5 3 5C1.89543 5 1 4.10457 1 3C1 1.89543 1.89543 1 3 1C4.10457 1 5 1.89543 5 3Z" fill="${fillColor}"/><path d="M15 13C15 14.1046 14.1046 15 13 15C11.8954 15 11 14.1046 11 13C11 11.8954 11.8954 11 13 11C14.1046 11 15 11.8954 15 13Z" fill="${fillColor}"/><path d="M9 4.5C9 3.67157 9.67157 3 10.5 3C11.3284 3 12 3.67157 12 4.5V9H14V4.5C14 2.567 12.433 1 10.5 1C8.567 1 7 2.567 7 4.5V11.5C7 12.3284 6.32843 13 5.5 13C4.67157 13 4 12.3284 4 11.5V7H2V11.5C2 13.433 3.567 15 5.5 15C7.433 15 9 13.433 9 11.5V4.5Z" fill="${fillColor}"/></svg>`
}

/**
 * WhosOnSite primary brand Logo component derived from web/src/images/logo.svg.
 * Responds to color prop or parent color="currentColor".
 */
export const Logo: React.FC<LogoProps> = ({
  size = 28,
  color = 'currentColor',
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      {...props}
    >
      <path
        d="M5 3C5 4.10457 4.10457 5 3 5C1.89543 5 1 4.10457 1 3C1 1.89543 1.89543 1 3 1C4.10457 1 5 1.89543 5 3Z"
        fill={color}
      />
      <path
        d="M15 13C15 14.1046 14.1046 15 13 15C11.8954 15 11 14.1046 11 13C11 11.8954 11.8954 11 13 11C14.1046 11 15 11.8954 15 13Z"
        fill={color}
      />
      <path
        d="M9 4.5C9 3.67157 9.67157 3 10.5 3C11.3284 3 12 3.67157 12 4.5V9H14V4.5C14 2.567 12.433 1 10.5 1C8.567 1 7 2.567 7 4.5V11.5C7 12.3284 6.32843 13 5.5 13C4.67157 13 4 12.3284 4 11.5V7H2V11.5C2 13.433 3.567 15 5.5 15C7.433 15 9 13.433 9 11.5V4.5Z"
        fill={color}
      />
    </svg>
  )
}

export default Logo
