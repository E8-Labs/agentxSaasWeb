// Utilities for safely transporting branding data via headers/cookies
// - Slim the object to only necessary fields for SSR usage
// - Encode header value as Base64 to ensure ASCII-safe ByteString
// - Encode cookie value via encodeURIComponent(JSON)

/**
 * Pick only fields required for server-side theming and icons.
 * @param {object|null|undefined} branding
 * @returns {object|null}
 */
export function slimBranding(branding) {
  if (!branding || typeof branding !== 'object') return null
  const {
    primaryColor,
    secondaryColor,
    logoUrl,
    faviconUrl,
    companyName,
    faviconText,
    xbarTitle,
  } = branding || {}
  const slim = {
    primaryColor: primaryColor ?? null,
    secondaryColor: secondaryColor ?? null,
    logoUrl: logoUrl ?? null,
    faviconUrl: faviconUrl ?? null,
    companyName: companyName ?? null,
    faviconText: faviconText ?? null,
    xbarTitle: xbarTitle ?? null,
  }
  return slim
}

/**
 * Encode branding for header transport. Returns null if payload too large.
 * Prefix with "b64," to identify encoding.
 * @param {object} branding
 * @param {{limit?: number}} opts
 * @returns {string|null}
 */
function base64EncodeUtf8(str) {
  try {
    // Node.js / Web Crypto polyfill
    return Buffer.from(str, 'utf8').toString('base64')
  } catch {
    // Edge runtime fallback
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    // btoa expects binary string
    return btoa(binary)
  }
}

function base64DecodeUtf8(b64) {
  try {
    return Buffer.from(b64, 'base64').toString('utf8')
  } catch {
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  }
}

export function encodeBrandingHeader(branding, opts = {}) {
  const limit = typeof opts.limit === 'number' ? opts.limit : 8192
  const slim = slimBranding(branding)
  if (!slim) return null
  try {
    const json = JSON.stringify(slim)
    // Base64 encode JSON in UTF-8
    const b64 = base64EncodeUtf8(json)
    const value = `b64,${b64}`
    // guard against oversized headers
    if (value.length > limit) {
      return null
    }
    return value
  } catch {
    return null
  }
}

/**
 * Decode branding from header value. Supports both new b64 and legacy JSON.
 * @param {string|null} value
 * @returns {object|null}
 */
export function decodeBrandingHeader(value) {
  if (!value || typeof value !== 'string') return null
  try {
    if (value.startsWith('b64,')) {
      const b64 = value.slice(4)
      const json = base64DecodeUtf8(b64)
      const obj = JSON.parse(json)
      return obj && typeof obj === 'object' ? obj : null
    }
    // Legacy: try plain JSON
    try {
      const obj = JSON.parse(value)
      return obj && typeof obj === 'object' ? obj : null
    } catch {
      // Some environments might have base64 without prefix; try that as last resort
      try {
        const json = base64DecodeUtf8(value)
        const obj = JSON.parse(json)
        return obj && typeof obj === 'object' ? obj : null
      } catch {
        return null
      }
    }
  } catch {
    return null
  }
}

/**
 * Encode branding for cookie storage.
 * @param {object} branding
 * @returns {string|null}
 */
export function encodeBrandingCookie(branding) {
  const slim = slimBranding(branding)
  if (!slim) return null
  try {
    return encodeURIComponent(JSON.stringify(slim))
  } catch {
    return null
  }
}
