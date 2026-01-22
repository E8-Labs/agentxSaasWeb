'use client'

import React, { useState } from 'react'
import { X, MessageSquare, Mail, Loader2 } from 'lucide-react'

/**
 * DraftCards component - displays AI-generated draft responses as horizontal scrolling cards
 * When user selects a draft, it populates the composer body field
 */
const DraftCards = ({
  drafts = [],
  loading = false,
  onSelectDraft,
  onDiscardDraft,
  selectedDraftId = null,
}) => {
  const [expandedDraftId, setExpandedDraftId] = useState(null)

  // Don't render if no drafts and not loading
  if (!loading && (!drafts || drafts.length === 0)) {
    return null
  }

  // Get the icon based on message type
  const getMessageIcon = (messageType) => {
    if (messageType === 'email') {
      return <Mail size={16} className="text-blue-500" />
    }
    return <MessageSquare size={16} className="text-green-500" />
  }

  // Get the label based on message type and variant number
  const getDraftLabel = (draft) => {
    const typeLabel = draft.messageType === 'email' ? 'Email' : 'SMS'
    return `${typeLabel} Response ${draft.variantNumber || 1}`
  }

  // Truncate content for preview
  const truncateContent = (content, maxLength = 120) => {
    if (!content) return ''
    // Strip HTML tags for preview
    const plainText = content.replace(/<[^>]*>/g, '').trim()
    if (plainText.length <= maxLength) return plainText
    return plainText.substring(0, maxLength) + '...'
  }

  // Get full content (plain text)
  const getFullContent = (content) => {
    if (!content) return ''
    return content.replace(/<[^>]*>/g, '').trim()
  }

  const handleCardClick = (draft) => {
    onSelectDraft(draft)
  }

  const handleDiscardClick = (e, draftId) => {
    e.stopPropagation()
    onDiscardDraft(draftId)
  }

  const handleReadMore = (e, draftId) => {
    e.stopPropagation()
    setExpandedDraftId(expandedDraftId === draftId ? null : draftId)
  }

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          <span className="text-sm text-gray-600">Generating responses...</span>
        </div>
      )}

      {/* Draft cards - horizontal scrolling */}
      {!loading && drafts.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {drafts.map((draft) => {
            const isSelected = selectedDraftId === draft.id
            const isExpanded = expandedDraftId === draft.id
            const content = getFullContent(draft.content)
            const needsReadMore = content.length > 120

            return (
              <div
                key={draft.id}
                onClick={() => handleCardClick(draft)}
                className={`
                  flex-shrink-0 max-w-[60%] rounded-lg p-3 cursor-pointer transition-all duration-200
                  border-2
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                  }
                `}
              >
                {/* Header with title and discard button */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getMessageIcon(draft.messageType)}
                    <span className={`text-sm font-semibold ${
                      draft.messageType === 'email' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {getDraftLabel(draft)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDiscardClick(e, draft.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Discard this draft"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Email subject (if applicable) */}
                {draft.messageType === 'email' && draft.subject && (
                  <div className="text-xs text-gray-500 mb-2 truncate">
                    <span className="font-medium">Subject:</span> {draft.subject}
                  </div>
                )}

                {/* Draft content */}
                <div className="text-sm text-gray-700 leading-relaxed">
                  {isExpanded ? content : truncateContent(content)}
                  {needsReadMore && (
                    <button
                      onClick={(e) => handleReadMore(e, draft.id)}
                      className="ml-1 text-blue-600 font-medium hover:underline"
                    >
                      {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DraftCards
