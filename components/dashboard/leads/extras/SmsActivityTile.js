'use client'

import React from 'react'
import ActivityTile from './ActivityTile'
import EmailSmsTranscriptCN from './EmailSmsTranscriptCN'

const SmsActivityTile = ({
  item,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <ActivityTile
      item={item}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <EmailSmsTranscriptCN item={item} />
    </ActivityTile>
  )
}

export default SmsActivityTile

