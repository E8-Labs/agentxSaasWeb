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
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)
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

