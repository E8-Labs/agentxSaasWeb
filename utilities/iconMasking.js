/**
 * Global utility function for rendering icons with branding color using mask-image
 * This function applies the brand color to icons using CSS masking, allowing icons
 * to dynamically match the branding color set via CSS variables.
 * 
 * @param {string} iconPath - Path to the icon image (SVG or PNG)
 * @param {number} width - Width of the icon in pixels
 * @param {number} height - Height of the icon in pixels
 * @param {string} fallbackColor - Optional fallback color if brand color is not available (default: 'hsl(270 75% 50%)')
 * @returns {JSX.Element} - React element with masked icon
 */
export function renderBrandedIcon(iconPath, width, height, fallbackColor = 'hsl(270 75% 50%)') {
  // Handle server-side rendering
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // Return a placeholder div for SSR
    return (
      <div
        style={{
          width: width,
          height: height,
          minWidth: width,
          minHeight: height,
        }}
      />
    )
  }

  // Get brand color from CSS variable
  const root = document.documentElement
  const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()

  // Use brand color if available, otherwise use fallback
  const iconColor = brandColor && brandColor.length >= 3
    ? `hsl(${brandColor})`
    : fallbackColor

  // Use mask-image approach: background color with icon as mask
  // This works for both SVG and PNG icons
  return (
    <div
      style={{
        width: width,
        height: height,
        minWidth: width,
        minHeight: height,
        backgroundColor: iconColor,
        WebkitMaskImage: `url(${iconPath})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        WebkitMaskMode: 'alpha',
        maskImage: `url(${iconPath})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        maskMode: 'alpha',
        transition: 'background-color 0.2s ease-in-out',
        flexShrink: 0,
      }}
    />
  )
}

