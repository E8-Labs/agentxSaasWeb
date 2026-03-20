'use client'

import React from 'react'
import ActivityTile from './ActivityTile'
import EmailSmsTranscriptCN from './EmailSmsTranscriptCN'

const EmailActivityTile = ({
  item,
  isExpanded,
  onToggleExpand,
  onCampaignStatClick,
  onCampaignStatMouseLeave,
  campaignStatAnchorActivityId,
  campaignStatData,
  campaignStatLoading,
  isLastActivityItem = false,
}) => {
  return (
    <ActivityTile
      item={item}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
    >
      <EmailSmsTranscriptCN
        item={item}
        onCampaignStatClick={onCampaignStatClick}
        onCampaignStatMouseLeave={onCampaignStatMouseLeave}
        campaignStatAnchorActivityId={campaignStatAnchorActivityId}
        campaignStatData={campaignStatData}
        campaignStatLoading={campaignStatLoading}
        isLastActivityItem={isLastActivityItem}
      />
    </ActivityTile>
  )
}

export default EmailActivityTile

