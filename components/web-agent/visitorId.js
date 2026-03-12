'use client'

export const WEB_CHAT_VISITOR_ID_KEY = 'webChatVisitorId'

/**
 * Get or create a stable visitor id for web chat (shared link resolution, history).
 * Same value must be used when calling resolve-share and join-shared.
 */
export function getVisitorId() {
  if (typeof window === 'undefined') return null
  let id = localStorage.getItem(WEB_CHAT_VISITOR_ID_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    localStorage.setItem(WEB_CHAT_VISITOR_ID_KEY, id)
  }
  return id
}
