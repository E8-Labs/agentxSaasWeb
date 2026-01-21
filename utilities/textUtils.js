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

