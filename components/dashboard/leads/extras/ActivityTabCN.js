'use client'

import React from 'react'
import { Clock, ChevronDown, ChevronUp, Copy, FileText } from 'lucide-react'
import Image from 'next/image'
import moment from 'moment'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { GetFormattedDateString } from '@/utilities/utility'
import { callStatusColors } from '@/constants/Constants'
import NoVoicemailView from '../../myagentX/NoVoicemailView'
import {
  TypographyBody,
  TypographyCaption,
  TypographyBodySemibold,
  TypographyBodyMedium,
} from '@/lib/typography'

const ActivityTabCN = ({
  callActivity = [],
  isExpandedActivity = [],
  onToggleExpand,
  onCopyCallId,
  onReadTranscript,
  onPlayRecording,
  getCommunicationTypeIcon,
  getOutcome,
  showColor,
  callTranscript,
  emailSmsTranscript,
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

  const getIcon = (item) => {
    const iconPath = getCommunicationTypeIcon(item)
    return (
      <div
        className="h-4 w-4"
        style={{
          backgroundColor: '#000000',
          WebkitMaskImage: `url(${iconPath})`,
          maskImage: `url(${iconPath})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    )
  }

  return (
    <div>
      {callActivity.map((item, index) => (
        <div key={index} className="mt-4">
          <TypographyCaption className="text-muted-foreground -ms-4">
            {GetFormattedDateString(item?.createdAt, true)}
          </TypographyCaption>
          <div className="w-full flex flex-row items-center gap-2 h-full">
            <div
              className="pb-4 pt-6 ps-4 w-full"
              style={{ borderLeft: '1px solid hsl(var(--border))' }}
            >
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                  {getIcon(item)}
                  <TypographyBodySemibold>Outcome</TypographyBodySemibold>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-full bg-muted"
                  onClick={() => onToggleExpand(item)}
                >
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: showColor(item) }}
                  />
                  <TypographyBodyMedium>{getOutcome(item)}</TypographyBodyMedium>
                  {item.callOutcome !== 'No Answer' && (
                    isExpandedActivity.includes(item.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </Button>
              </div>
              {isExpandedActivity.includes(item.id) && (
                <>
                  {item.status === 'voicemail' || item.callOutcome === 'Voicemail' ? (
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => onCopyCallId(item.callId)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <NoVoicemailView
                          showAddBtn={false}
                          title={item.agent.hasVoicemail ? 'Voicemail Delivered' : 'Not able to Leave a Voicemail'}
                          subTitle={
                            item.agent.hasVoicemail
                              ? 'Delivered during the first missed call'
                              : 'The phone was either a landline or has a full voicemail'
                          }
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="mt-6">
                      <CardContent className="p-4">
                        {item.communicationType === 'sms' ||
                        item.communicationType === 'email'
                          ? emailSmsTranscript(item)
                          : callTranscript(item)}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityTabCN

