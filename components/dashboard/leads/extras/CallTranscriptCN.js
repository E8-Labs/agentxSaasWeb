'use client'

import React from 'react'
import moment from 'moment'
import Image from 'next/image'
import { Copy, FileText, ListChecks } from 'lucide-react'
import { Tooltip } from '@mui/material'

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

const CallTranscriptCN = ({
  item,
  onPlayRecording,
  onCopyCallId,
  onReadTranscript,
}) => {
  const callSummary = item.callSummary
  const summaryText = callSummary?.callSummary || null
  const hasSummary = summaryText && summaryText.trim()

  // Use summary if available, otherwise fallback to transcript
  const displayText = hasSummary
    ? summaryText
    : item.transcript || 'No summary or transcript available'

  return (
    <div className="flex flex-col">
      {/* Top row: Duration, Play button, and Icons (Sentiment, Temp, Next Steps) */}
      <div className="flex flex-row items-center justify-between mt-4 text-sm">
        <div className="flex flex-row items-center gap-3">
          <TypographyBodyMedium className="text-foreground">
            {moment(item?.duration * 1000).format('mm:ss')}
          </TypographyBodyMedium>
          <button
            onClick={() => onPlayRecording?.(item?.recordingUrl, item.callId)}
            className="flex items-center justify-center"
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
        <div className="flex flex-row items-center gap-3">
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
            <Tooltip
              title={
                <div style={{ whiteSpace: 'pre-line' }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    Next Steps:
                  </div>
                  {formatNextStepsForTooltip(callSummary.nextSteps)}
                </div>
              }
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
                <ListChecks size={18} color="hsl(var(--brand-primary))" />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Summary text */}
      <div className="w-full mt-4 text-sm">
        <TypographyBodySemibold className="mb-2 text-muted-foreground">
          Summary
        </TypographyBodySemibold>
        <TypographyBodyMedium className="text-foreground leading-normal">
          {displayText}
        </TypographyBodyMedium>
      </div>

      {/* Bottom row: Call ID, Transcript icons (left) */}
      <div className="flex flex-row items-center justify-between mt-4">
        <div className="flex flex-row items-center gap-4">
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
              onClick={() => onCopyCallId?.(item.callId)}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Copy size={18} color="hsl(var(--brand-primary))" />
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
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FileText size={18} color="hsl(var(--brand-primary))" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}

export default CallTranscriptCN

