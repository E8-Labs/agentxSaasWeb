/**
 * Strip "On ... wrote:" quoted reply lines from email/message content (HTML or plain).
 * Supports both date orders: "On Wed, 25 Feb 2026" and "On Wed, Feb 25, 2026" (Gmail).
 * Use when displaying message content so already-stored messages show without the quote header.
 * @param {string} content - Raw message content (HTML or plain text)
 * @returns {string} Content with quoted reply line and everything after it removed
 */
export function stripQuotedReplyFromContent(content) {
  if (!content || typeof content !== 'string') return content

  // Pattern 1: "On [day], [date] [month] [year] at [time] ... wrote:" and everything after
  let result = content.replace(
    /On\s+\w+,\s+\d+\s+\w+\s+\d+\s+at\s+\d+:\d+\s+(?:AM|PM)\s*[\s\S]*?wrote:[\s\S]*$/im,
    '',
  )
  // Pattern 2: "On [day], [date] [month] [year], ... wrote:" (no time)
  result = result.replace(
    /On\s+\w+,\s+\d+\s+\w+\s+\d+\s*,?\s*[\s\S]*?wrote:[\s\S]*$/im,
    '',
  )
  // Pattern 3: "On [day], [month] [date], [year] at [time] ... wrote:" (Gmail)
  result = result.replace(
    /On\s+\w+,\s+\w+\s+\d+,\s+\d+\s+at\s+\d+:\d+\s+(?:AM|PM)\s*[\s\S]*?wrote:[\s\S]*$/im,
    '',
  )
  // Pattern 4: "On [day], [month] [date], [year], ... wrote:" (Gmail, no time)
  result = result.replace(
    /On\s+\w+,\s+\w+\s+\d+,\s+\d+\s*,?\s*[\s\S]*?wrote:[\s\S]*$/im,
    '',
  )

  // Trim trailing <br>, newlines, and whitespace
  return result.replace(/(<br\s*\/?>|\r\n|\n|\r)+\s*$/gi, '').trim()
}
