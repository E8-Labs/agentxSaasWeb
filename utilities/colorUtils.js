/**
 * Color utility functions for converting between color formats
 * Used for dynamic agency branding color theming
 */

/**
 * Validates if a string is a valid hex color
 * @param {string} hex - Hex color string (e.g., "#7902DF" or "7902DF")
 * @returns {boolean} - True if valid hex color
 */
export function isValidHex(hex) {
  if (!hex || typeof hex !== 'string') return false
  
  // Remove # if present
  const cleanHex = hex.replace('#', '')
  
  // Check if it's 3 or 6 characters and only contains hex digits
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

/**
 * Converts a hex color to HSL format (space-separated, no commas)
 * Used for CSS custom properties: hsl(var(--color))
 * @param {string} hex - Hex color string (e.g., "#7902DF" or "7902DF")
 * @returns {string} - HSL color string (e.g., "270 75% 50%")
 */
export function hexToHsl(hex) {
  if (!hex || !isValidHex(hex)) {
    // Return default purple in HSL if invalid
    return '270 75% 50%'
  }

  // Remove # if present
  let cleanHex = hex.replace('#', '')

  // Convert 3-digit hex to 6-digit
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  // Find min and max RGB values
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l

  // Calculate lightness
  l = (max + min) / 2

  // Calculate saturation
  if (max === min) {
    s = 0 // Achromatic (gray)
    h = 0 // Hue is undefined for grayscale
  } else {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    // Calculate hue
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / delta + 2) / 6
        break
      case b:
        h = ((r - g) / delta + 4) / 6
        break
      default:
        h = 0
    }
  }

  // Convert to degrees and percentages
  h = Math.round(h * 360)
  s = Math.round(s * 100)
  l = Math.round(l * 100)

  // Return space-separated format for CSS: "H S% L%"
  return `${h} ${s}% ${l}%`
}

/**
 * Gets default purple color in HSL format
 * Used as fallback when no agency colors are set
 * @returns {string} - HSL color string for default purple
 */
export function getDefaultPrimaryColor() {
  return '270 75% 50%' // #7902DF in HSL
}

/**
 * Gets default secondary color in HSL format
 * Used as fallback when no agency colors are set
 * @returns {string} - HSL color string for default secondary
 */
export function getDefaultSecondaryColor() {
  return '270 60% 60%' // Lighter purple variant
}

/**
 * Calculates CSS filter to convert purple icons to brand color
 * @param {string} brandColorHex - Brand color in hex format (e.g., "#7902DF")
 * @returns {string} - CSS filter string
 */
export function calculateIconFilter(brandColorHex) {
  if (!brandColorHex || !isValidHex(brandColorHex)) {
    return 'brightness(0) saturate(100%)' // Default: black
  }

  // Get HSL values for brand color
  const hsl = hexToHsl(brandColorHex)
  const parts = hsl.split(' ')
  const h = parseFloat(parts[0])
  const s = parseFloat(parts[1].replace('%', ''))
  const l = parseFloat(parts[2].replace('%', ''))

  // Default purple (#7902DF) is at 270deg hue
  const defaultPurpleHue = 270
  const hueDiff = h - defaultPurpleHue

  // Normalize hue difference to -180 to 180 range
  let normalizedHueDiff = hueDiff
  if (normalizedHueDiff > 180) {
    normalizedHueDiff -= 360
  } else if (normalizedHueDiff < -180) {
    normalizedHueDiff += 360
  }

  // Calculate brightness adjustment
  // Purple has ~50% lightness, so adjust based on brand color lightness
  const defaultPurpleLightness = 50
  const lightnessDiff = l - defaultPurpleLightness
  const brightnessAdjust = 1 + lightnessDiff / 100

  // Return CSS filter string
  // Convert to grayscale, then hue-rotate to brand color, adjust brightness
  return `brightness(0) saturate(100%) hue-rotate(${normalizedHueDiff}deg) brightness(${brightnessAdjust})`
}

/**
 * Determines if a color is light or dark based on its perceived brightness
 * Uses relative luminance formula from WCAG guidelines
 * @param {string} hslString - HSL color string (e.g., "270 75% 50%")
 * @param {number} opacity - Opacity value (0-1), defaults to 1
 * @returns {boolean} - True if color is light (use dark text), false if dark (use light text)
 */
export function isLightColor(hslString, opacity = 1) {
  if (!hslString) return false

  // Parse HSL string
  const parts = hslString.split(' ')
  const h = parseFloat(parts[0]) || 0
  const s = parseFloat(parts[1]?.replace('%', '')) || 0
  const l = parseFloat(parts[2]?.replace('%', '')) || 0

  // Adjust lightness based on opacity (blend with white background)
  // When opacity < 1, the color appears lighter because it blends with white
  const adjustedLightness = l + (100 - l) * (1 - opacity)

  // Use WCAG relative luminance threshold
  // Colors with lightness > 50% are considered light
  return adjustedLightness > 50
}

/**
 * Gets the brand primary color from CSS variable as HSL string
 * Can be used directly in inline styles: style={{ color: `hsl(${getBrandPrimaryHsl()})` }}
 * @returns {string} - HSL color string (e.g., "270 75% 50%") or default if not available
 */
export function getBrandPrimaryHsl() {
  if (typeof window === 'undefined') return getDefaultPrimaryColor()
  
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  
  if (brandPrimary) {
    return brandPrimary
  }
  
  return getDefaultPrimaryColor()
}

/**
 * Gets the brand primary color from CSS variable as hex string
 * Useful for inline styles that require hex format (e.g., Material-UI sx prop)
 * @returns {string} - Hex color string (e.g., "#7902DF") or default if not available
 */
export function getBrandPrimaryHex() {
  if (typeof window === 'undefined') return '#7902DF'
  
  const root = document.documentElement
  const brandPrimary = getComputedStyle(root).getPropertyValue('--brand-primary').trim()
  
  if (brandPrimary) {
    // Convert HSL to hex
    const hslMatch = brandPrimary.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
    if (hslMatch) {
      const h = parseInt(hslMatch[1]) / 360
      const s = parseInt(hslMatch[2]) / 100
      const l = parseInt(hslMatch[3]) / 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = l - c / 2
      
      let r = 0, g = 0, b = 0
      
      if (0 <= h && h < 1/6) {
        r = c; g = x; b = 0
      } else if (1/6 <= h && h < 2/6) {
        r = x; g = c; b = 0
      } else if (2/6 <= h && h < 3/6) {
        r = 0; g = c; b = x
      } else if (3/6 <= h && h < 4/6) {
        r = 0; g = x; b = c
      } else if (4/6 <= h && h < 5/6) {
        r = x; g = 0; b = c
      } else if (5/6 <= h && h < 1) {
        r = c; g = 0; b = x
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
  
  return '#7902DF' // Default fallback
}

