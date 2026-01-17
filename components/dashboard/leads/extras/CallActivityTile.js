'use client'

import React from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ActivityTile from './ActivityTile'
import CallTranscriptCN from './CallTranscriptCN'
import NoVoicemailView from '../../myagentX/NoVoicemailView'

const CallActivityTile = ({
  item,
  isExpanded,
  onToggleExpand,
  onPlayRecording,
  onCopyCallId,
  onReadTranscript,
  leadId = null,
  leadName = null,
  selectedUser = null,
}) => {
  // Handle voicemail case
  if (item.status === 'voicemail' || item.callOutcome === 'Voicemail') {
    return (
      <ActivityTile
        item={item}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      >
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onCopyCallId?.(item.callId)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <NoVoicemailView
            showAddBtn={false}
            title={item.agent?.hasVoicemail ? 'Voicemail Delivered' : 'Not able to Leave a Voicemail'}
            subTitle={
              item.agent?.hasVoicemail
                ? 'Delivered during the first missed call'
                : 'The phone was either a landline or has a full voicemail'
            }
          />
        </div>
      </ActivityTile>
    )
  }

  // Regular call with transcript
  return (
    <ActivityTile
      item={item}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <CallTranscriptCN
        item={item}
        onPlayRecording={onPlayRecording}
        onCopyCallId={onCopyCallId}
        onReadTranscript={onReadTranscript}
        leadId={leadId}
        leadName={leadName}
        selectedUser={selectedUser}
      />
    </ActivityTile>
  )
}

export default CallActivityTile

