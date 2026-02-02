/**
 * Utility functions for text processing and formatting
 */

/**
 * Converts HTML content to plain text
 * @param {string} html - HTML string to convert
 * @returns {string} Plain text version of the HTML
 */
export function htmlToPlainText(html) {
  if (!html || typeof html !== 'string') {
    return html || ''
  }

  // IMPORTANT: Convert <br> and <br/> tags to newlines BEFORE processing
  // This preserves line breaks that would otherwise be lost
  html = html.replace(/<br\s*\/?>/gi, '\n')

  // Check if content is already plain text (no HTML tags)
  const hasHtmlTags = /<[^>]+>/g.test(html)
  
  if (!hasHtmlTags) {
    // Already plain text, just return it
    return html.trim()
  }

  // Create a temporary DOM element to parse HTML
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    // Get text content and clean it up
    let text = tempDiv.textContent || tempDiv.innerText || ''
    
    // Clean up extra whitespace (but preserve newlines from <br> tags)
    // Replace multiple spaces with single space, but keep newlines
    text = text
      .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with double newline
      .trim()
    
    return text
  }

  // Fallback for server-side: basic regex-based HTML tag removal
  // Note: <br> tags were already converted to \n above
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space (but keep newlines)
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with double newline
    .trim();
}

/**
 * Formats file size to human-readable format (KB or MB)
 * Handles both bytes and KB input formats
 * @param {number} size - File size (in bytes or KB, auto-detected)
 * @returns {string} Formatted size string (e.g., "3KB", "3.5MB")
 */
/**
 * Escapes HTML special characters and converts URLs to clickable links.
 * Preserves newlines as <br /> tags.
 * @param {string} text - Plain text to linkify
 * @returns {string} HTML string with links and line breaks
 */
export function linkifyText(text) {
  if (!text) return ''

  // Escape HTML to avoid injection when rendering as HTML
  const escapeHtml = (str) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

  const escaped = escapeHtml(text)

  // Detect URLs (with or without protocol) and convert to links
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/gi

  const linked = escaped.replace(urlRegex, (match) => {
    const hasProtocol = match.startsWith('http://') || match.startsWith('https://')
    const href = hasProtocol ? match : `https://${match}`
    return `<a href="${href}" class="underline text-brand-primary hover:text-brand-primary/80" target="_blank" rel="noopener noreferrer">${match}</a>`
  })

  // Preserve newlines
  return linked.replace(/\n/g, '<br />')
}

/**
 * Sanitizes HTML by converting to plain text, removing quoted email content,
 * and linkifying URLs.
 * @param {string} html - HTML string to sanitize
 * @param {Function} sanitizeHTML - Sanitizer function (unused but kept for API compat)
 * @returns {string} Cleaned HTML string with links
 */
export function sanitizeAndLinkifyHTML(html, sanitizeHTML) {
  if (!html) return ''

  // First convert HTML to plain text (this preserves URLs as text)
  // We do this before sanitizing to ensure URLs aren't broken by HTML processing
  let plainText = htmlToPlainText(html)

  // Remove quoted text from plain text (simpler and more reliable than HTML processing)
  // Remove lines starting with "On ... wrote:"
  plainText = plainText.replace(/^On\s+.*?wrote:.*$/gmi, '')
  // Remove lines starting with common email headers
  plainText = plainText.replace(/^(From|Sent|To|Subject|Date):.*$/gmi, '')
  // Remove quoted text blocks (lines starting with >)
  plainText = plainText.replace(/^>.*$/gm, '')
  // Remove content after common separators
  const separatorIndex = plainText.search(/^(From|Sent|To|Subject|Date):/m)
  if (separatorIndex > 0) {
    plainText = plainText.substring(0, separatorIndex).trim()
  }
  // Clean up multiple newlines (but preserve single and double newlines for line breaks)
  plainText = plainText.replace(/\n{3,}/g, '\n\n').trim()

  // Now linkify URLs in the cleaned plain text
  // linkifyText will convert newlines to <br /> tags automatically
  return linkifyText(plainText)
}

export function formatFileSize(size) {
  if (!size || size === 0) {
    return '0KB'
  }

  // Determine if size is in bytes or KB
  // Strategy: Values < 10000 are almost certainly in KB
  // Values >= 10000 could be bytes or KB - we need to be smarter
  // If dividing by 1024 gives a reasonable KB value (< 10000), it's likely bytes
  let sizeInKB
  
  if (size < 10000) {
    // Small values are almost certainly in KB (e.g., 9428.3 KB, 621 KB, 384 KB)
    sizeInKB = size
  } else {
    // For larger values, check if it's bytes or KB
    // If dividing by 1024 gives a value < 10000, it's likely bytes
    const potentialKB = size / 1024
    if (potentialKB < 10000) {
      // Likely bytes, convert to KB
      sizeInKB = potentialKB
    } else {
      // Likely already in KB (very large files)
      sizeInKB = size
    }
  }

  // ALWAYS convert to MB if >= 1MB (1024 KB)
  // This ensures 9428.3 KB becomes 9.2 MB, not 9428.3 MB
  if (sizeInKB >= 1024) {
    const mb = sizeInKB / 1024
    // Round to 1 decimal place if needed, otherwise show as integer
    const rounded = mb % 1 === 0 ? mb : Math.round(mb * 10) / 10
    return `${rounded}MB`
  } else {
    // Show in KB
    // Round to 1 decimal place if needed, otherwise show as integer
    const rounded = sizeInKB % 1 === 0 ? sizeInKB : Math.round(sizeInKB * 10) / 10
    return `${rounded}KB`
  }
}

