'use client'

import React from 'react'
import ActivityTile from './ActivityTile'
import EmailSmsTranscriptCN from './EmailSmsTranscriptCN'

const EmailActivityTile = ({
  item,
  isExpanded,
  onToggleExpand,
}) => {
  // console.log("Item for email activity tile", item);
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

export default EmailActivityTile

