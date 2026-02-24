'use client'

import React, { useEffect, useState } from 'react'
import moment from 'moment'
import Image from 'next/image'
import { Copy, FileText, ListChecks } from 'lucide-react'
import { Tooltip } from '@mui/material'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

import {
  TypographyBody,
  TypographyBodySemibold,
  TypographyBodyMedium,
} from '@/lib/typography'
import {
  getSentimentIcon,
  getTemperatureIconForActivity,
  formatNextStepsForTooltip,
} from './activityUtils'
import CreateTaskFromNextStepsModal from './CreateTaskFromNextStepsModal'

const CallTranscriptCN = ({
  item,
  onPlayRecording,
  onCopyCallId,
  onReadTranscript,
  leadId = null,
  leadName = null,
  selectedUser = null,
  bottomRightContent = null,
}) => {
  const callSummary = item.callSummary
  const summaryText = callSummary?.callSummary || null
  const hasSummary = summaryText && summaryText.trim()

  // Use summary if available, otherwise show "No summary available"
  const displayText = hasSummary
    ? summaryText
    : 'No summary available'

  // State for popover and modal
  const [nextStepsPopoverOpen, setNextStepsPopoverOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)

  // useEffect(() => {
  //   console.log("leadId in call transcript is", leadId)
  // }, [leadId])

  return (
    <div className="flex flex-col gap-1">
      {/* Top row: Duration, Play button, and Icons (Sentiment, Temp, Next Steps) */}
      <div
        className="flex flex-row items-center justify-between text-sm h-auto p-3 bg-white"
        style={{ borderBottom: '1px solid #eaeaea' }}
      >
        <div className="flex flex-row items-center gap-3">
          <TypographyBodyMedium className="text-foreground font-normal">
            {moment(item?.duration * 1000).format('mm:ss')}
          </TypographyBodyMedium>
          <button
            onClick={() => {
              console.log("Playing recording", item?.recordingUrl, item.callId);
              onPlayRecording?.(item?.recordingUrl, item.callId)
              console.log("after Recording URL");
            }}
            className="flex items-center justify-center hover:bg-black/[0.02] rounded transition-colors"
            style={{
              width: 35,
              height: 35,
            }}
          >
            <Image
              src={'/assets/play.png'}
              height={35}
              width={35}
              alt="Play recording"
              style={{
                filter: 'hue-rotate(0deg) saturate(1) brightness(1)',
              }}
            />
          </button>
        </div>

        {/* Top right icons: Sentiment, Temperature, Next Steps */}
        <div className="flex flex-row items-center gap-3 text-black [&_svg]:text-black [&_svg]:text-current" style={{ color: '#000' }}>
          {callSummary?.prospectSentiment && (
            <Tooltip
              title={`Sentiment: ${callSummary.prospectSentiment}`}
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    color: '#333',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    maxWidth: '300px',
                  },
                },
                arrow: {
                  sx: {
                    color: '#ffffff',
                  },
                },
              }}
            >
              <div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {getSentimentIcon(callSummary.prospectSentiment)}
              </div>
            </Tooltip>
          )}

          {callSummary?.leadTemperature && (
            <Tooltip
              title={`Temperature: ${callSummary.leadTemperature}`}
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    color: '#333',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    maxWidth: '300px',
                  },
                },
                arrow: {
                  sx: {
                    color: '#ffffff',
                  },
                },
              }}
            >
              <div
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {getTemperatureIconForActivity(callSummary.leadTemperature)}
              </div>
            </Tooltip>
          )}

          {callSummary?.nextSteps && (
            <Popover open={nextStepsPopoverOpen} onOpenChange={setNextStepsPopoverOpen}>
              <PopoverTrigger asChild>
                <div
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  onMouseEnter={() => setNextStepsPopoverOpen(true)}
                  onMouseLeave={() => setNextStepsPopoverOpen(false)}
                >
                  <ListChecks size={18} color="hsl(var(--brand-primary))" />
                </div>
              </PopoverTrigger>
              <PopoverContent 
                className="p-0 flex flex-col gap-1"
                onMouseEnter={() => setNextStepsPopoverOpen(true)}
                onMouseLeave={() => setNextStepsPopoverOpen(false)}
                side="right"
                align="center"
                style={{
                  zIndex: 15000,
                  width: '280px',
                  animation: 'nextStepsPopoverEntry 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)',
                }}
              >
                <style>{`
                  @keyframes nextStepsPopoverEntry {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                  }
                `}</style>
                <div
                  className="px-4 py-3 border-b"
                  style={{ borderColor: '#eaeaea', whiteSpace: 'pre-line' }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                    Next Steps:
                  </div>
                  <div style={{ fontSize: '14px', color: '#333', wordBreak: 'break-word' }}>
                    {formatNextStepsForTooltip(callSummary.nextSteps)}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <Button
                    onClick={() => {
                      setNextStepsPopoverOpen(false)
                      setTaskModalOpen(true)
                    }}
                    className="w-full bg-brand-primary text-white hover:bg-brand-primary/90"
                    size="sm"
                  >
                    Add task
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Summary text */}
      <div className="w-full text-sm pt-2 px-3">
        <TypographyBodySemibold className="mb-2 text-muted-foreground">
          Summary
        </TypographyBodySemibold>
        <TypographyBody className="text-foreground leading-normal text-black/80 font-normal">
          {displayText}
        </TypographyBody>
      </div>

      {/* Bottom row: Call ID, Transcript icons (left), optional right content */}
      <div className="flex flex-row items-center justify-between px-3">
        <div className="flex flex-row items-center gap-1 text-black [&_svg]:text-black [&_svg]:text-current [&_button_svg]:opacity-80 origin-left" style={{ color: '#000', gap: 4, transform: 'scale(0.95)' }}>
          {/* Call ID Icon */}
          <Tooltip
            title="Copy Call ID"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  backgroundColor: '#ffffff',
                  color: '#333',
                  fontSize: '14px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                },
              },
              arrow: {
                sx: {
                  color: '#ffffff',
                },
              },
            }}
          >
            <button
              onClick={() => {
                if (item.callId) {
                  onCopyCallId?.(item.callId)
                } else {
                  console.warn('Call ID is null or undefined, cannot copy')
                }
              }}
              disabled={!item.callId}
              className="rounded flex items-center justify-center w-10 h-10 bg-transparent hover:bg-black/5 transition-colors duration-150 ease-out"
              style={{
                cursor: item.callId ? 'pointer' : 'not-allowed',
                opacity: item.callId ? 1 : 0.5,
                padding: 8,
                borderRadius: 8,
                width: 40,
                height: 40,
              }}
            >
              <Copy size={18} color="#000" style={{ opacity: 0.8 }} />
            </button>
          </Tooltip>

          {/* Transcript Icon */}
          {item.transcript && (
            <Tooltip
              title="Read Transcript"
              arrow
              componentsProps={{
                tooltip: {
                  sx: {
                    backgroundColor: '#ffffff',
                    color: '#333',
                    fontSize: '14px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
                  },
                },
                arrow: {
                  sx: {
                    color: '#ffffff',
                  },
                },
              }}
            >
              <button
                onClick={() => onReadTranscript?.(item)}
                className="rounded flex items-center justify-center w-10 h-10 bg-transparent hover:bg-black/5 transition-colors duration-150 ease-out"
                style={{ cursor: 'pointer', padding: 8, borderRadius: 8, width: 40, height: 40 }}
              >
                <FileText size={18} color="#000" style={{ opacity: 0.8 }} />
              </button>
            </Tooltip>
          )}
        </div>
        {bottomRightContent}
      </div>

      {/* Create Task Modal */}
      {callSummary?.nextSteps && (
        <CreateTaskFromNextStepsModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          nextSteps={callSummary.nextSteps}
          leadId={leadId}
          leadName={leadName}
          callId={item.id}
          selectedUser={selectedUser}
        />
      )}
    </div>
  )
}

export default CallTranscriptCN

