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
    
    // Clean up extra whitespace
    text = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim()
    
    return text
  }

  // Fallback for server-side: basic regex-based HTML tag removal
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

/**
 * Formats file size to human-readable format (KB or MB)
 * Handles both bytes and KB input formats
 * @param {number} size - File size (in bytes or KB, auto-detected)
 * @returns {string} Formatted size string (e.g., "3KB", "3.5MB")
 */
export function formatFileSize(size) {
  if (!size || size === 0) {
    return '0KB'
  }

  // Determine if size is in bytes or KB
  // If size > 1,000,000, it's likely already in KB (since files rarely exceed 1GB in bytes)
  // Otherwise, assume it's in bytes
  let sizeInKB
  
  if (size > 1000000) {
    // Already in KB (e.g., 384094 KB)
    sizeInKB = size
  } else {
    // Assume it's in bytes, convert to KB
    sizeInKB = size / 1024
  }

  // Convert to MB if >= 1MB (1024 KB)
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

