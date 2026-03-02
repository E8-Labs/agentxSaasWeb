/**
 * Strips quoted reply content from email/message body text.
 * Removes "Replying to", "On ... wrote:", lines starting with ">", and similar quoted blocks.
 * SSR-safe (no document/window).
 *
 * @param {string} content - Raw HTML or plain text content
 * @returns {string} Content with quoted reply blocks removed
 */
function stripQuotedReplyFromContent(content) {
  if (!content || typeof content !== 'string') return content

  // Normalize: replace <br> with newlines for consistent line handling
  let text = content.replace(/<br\s*\/?>/gi, '\n')

  // Strip HTML tags for pattern matching (SSR-safe regex only)
  if (text.includes('<')) {
    text = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    // Restore single newlines where we had line breaks (simplified)
    text = text.replace(/\s/g, '\n').replace(/\n+/g, '\n').trim()
  }

  // Pattern 1: "Replying to [subject] [sender]" - Gmail style
  const replyingToPattern = /Replying\s+to\s+[^\n]+/i
  const replyingToMatch = text.match(replyingToPattern)
  if (replyingToMatch) {
    const matchIndex = text.indexOf(replyingToMatch[0])
    if (matchIndex > 0) {
      text = text.substring(0, matchIndex).trim()
    } else {
      text = ''
    }
  }

  // Pattern 2: "On [date] [time] [sender] wrote:" and everything after
  const onDatePattern = /On\s+\w+,\s+\w+\s+\d+,\s+\d+\s+at\s+\d+:\d+\s+(?:AM|PM)\s+[^:]+:\s*/i
  const onDateMatch = text.match(onDatePattern)
  if (onDateMatch) {
    const index = text.indexOf(onDateMatch[0])
    if (index > 0) {
      text = text.substring(0, index).trim()
    } else {
      text = ''
    }
  }

  // Pattern 3: Remove lines starting with ">" (quoted lines)
  if (text.includes('>')) {
    const lines = text.split('\n')
    const cleanedLines = []
    let foundQuoteStart = false
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.startsWith('>') || trimmedLine.match(/^On\s+\w+,\s+\w+\s+\d+/i)) {
        foundQuoteStart = true
        break
      }
      if (!foundQuoteStart) {
        cleanedLines.push(line)
      }
    }
    text = cleanedLines.join('\n').trim()
  }

  // Pattern 4: "-----Original Message-----" and everything after
  const originalMessagePattern = /-----Original Message-----/i
  const origIndex = text.toLowerCase().indexOf('-----original message-----')
  if (origIndex >= 0 && origIndex > 0) {
    text = text.substring(0, origIndex).trim()
  }

  // Pattern 5: Common email headers (From:, Sent:, etc.)
  const headerPatterns = [/^From:.*$/m, /^Sent:.*$/m, /^To:.*$/m, /^Subject:.*$/m, /^Date:.*$/m]
  for (const pattern of headerPatterns) {
    const match = text.match(pattern)
    if (match) {
      const index = text.indexOf(match[0])
      if (index > 0) {
        text = text.substring(0, index).trim()
      }
    }
  }

  return text.trim()
}

export default stripQuotedReplyFromContent
export { stripQuotedReplyFromContent }
