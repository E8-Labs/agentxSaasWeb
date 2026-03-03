'use client'

import React from 'react'
import { Clock } from 'lucide-react'
import {
  TypographyBody,
} from '@/lib/typography'
import CallActivityTile from './CallActivityTile'
import EmailActivityTile from './EmailActivityTile'
import SmsActivityTile from './SmsActivityTile'

const ActivityTabCN = ({
  callActivity = [],
  isExpandedActivity = [],
  onToggleExpand,
  onCopyCallId,
  onReadTranscript,
  onPlayRecording,
  leadId = null,
  leadName = null,
  selectedUser = null,
  tooltipZIndex,
}) => {
  if (callActivity?.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 w-full">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Clock className="h-6 w-6" />
        </div>
        <TypographyBody className="mt-4 italic text-muted-foreground">
          All activities related to this lead will be shown here
        </TypographyBody>
      </div>
    )
  }

  const renderActivityTile = (item) => {
    const isExpanded = isExpandedActivity.includes(item.id)
    
    const commonProps = {
      item,
      isExpanded,
      onToggleExpand: () => onToggleExpand(item),
    }
    
    // console.log("Common props activity tab", commonProps);

    if (item.communicationType === 'email') {
      return <EmailActivityTile key={item.id} {...commonProps} />
    } else if (item.communicationType === 'sms') {
      return <SmsActivityTile key={item.id} {...commonProps} />
    } else {
      // Call activity
      return (
        <CallActivityTile
          key={item.id}
          {...commonProps}
          onPlayRecording={onPlayRecording}
          onCopyCallId={onCopyCallId}
          onReadTranscript={onReadTranscript}
          leadId={leadId}
          leadName={leadName}
          selectedUser={selectedUser}
          tooltipZIndex={tooltipZIndex}
        />
      )
    }
  }

  return (
    <div className='ps-4'>
      {callActivity.map((item) => renderActivityTile(item))}
    </div>
  )
}

export default ActivityTabCN

