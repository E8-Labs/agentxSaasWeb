'use client'

import React from 'react'
import { Link2 } from 'lucide-react'

/**
 * Renders "Link conversation to: [Link to {name}]" for messages with suggested leads.
 * Parent provides onLink(threadId, targetLeadId) which should call the link-lead API and refresh.
 */
export default function SuggestedLeadLinks({ suggestedLeads, threadId, onLink, linkingLeadId }) {
  if (!suggestedLeads?.length || !threadId || !onLink) return null

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">Link conversation to:</span>
      {suggestedLeads.map((lead) => {
        const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed'
        const isLinking = linkingLeadId === lead.id
        return (
          <button
            key={lead.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onLink(threadId, lead.id)
            }}
            disabled={!!linkingLeadId}
            className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Link2 className="h-3 w-3" />
            {isLinking ? 'Linking…' : `Link to ${name}`}
          </button>
        )
      })}
    </div>
  )
}
