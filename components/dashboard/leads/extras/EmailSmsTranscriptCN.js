'use client'

import React from 'react'
import moment from 'moment'
import { BarChart2 } from 'lucide-react'

import {
  TypographyBody,
  TypographyBodySemibold,
  TypographyBodyMedium,
  TypographyCaption,
} from '@/lib/typography'
import {
  formatFileSize,
  sanitizeHTMLForEmailBody,
  linkifyText,
} from '@/utilities/textUtils'

/** Unescape HTML entities in a string (for content that may be stored escaped). */
function unescapeHtmlEntities(str) {
  if (!str || typeof str !== 'string') return str
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = str
    return tempDiv.textContent || tempDiv.innerText || str
  }
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

const EmailSmsTranscriptCN = ({
  item,
  onCampaignStatClick,
  onCampaignStatMouseLeave,
  campaignStatAnchorActivityId,
  campaignStatData,
  campaignStatLoading,
  isLastActivityItem = false,
}) => {
  const isEmail = item.communicationType === 'email'
  const rawContent = item.sentContent

  // Any content with HTML → sanitize and render as formatted; plain text → linkify (links + line breaks)
  const displayHtml = (() => {
    if (!rawContent || typeof rawContent !== 'string') return ''
    let content = rawContent
    if (content.includes('&lt;') || content.includes('&gt;') || content.includes('&amp;')) {
      content = unescapeHtmlEntities(content)
    }
    if (/<[^>]+>/.test(content)) {
      return sanitizeHTMLForEmailBody(content)
    }
    return linkifyText(content)
  })()

  return (
    <div className="flex flex-col items-start gap-2 text-sm p-3 rounded-lg bg-white">
      {item.sentSubject && (
        <div className="flex flex-row items-center gap-1 w-full min-w-0 mb-2">
          <TypographyBodySemibold className="text-muted-foreground shrink-0">
            Subject:
          </TypographyBodySemibold>
          <TypographyBodyMedium className="text-foreground min-w-0 flex-1 truncate">
            {item.sentSubject}
          </TypographyBodyMedium>
        </div>
      )}
      {item.sentContent && (
        <div className="flex flex-col items-start gap-2 w-full">
          <div
            className="prose prose-sm max-w-none break-words text-foreground leading-normal
              [&_p]:!mt-0 [&_p]:!mb-[0.2em] [&_p]:!leading-snug
              [&_ul]:!my-[0.2em] [&_ul]:!pl-[1.15em] [&_ul]:!list-disc
              [&_ol]:!my-[0.2em] [&_ol]:!pl-[1.15em]
              [&_li]:!my-[0.08em]
              [&_a]:text-brand-primary [&_a]:underline hover:[&_a]:opacity-80"
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        </div>
      )}
      {item.template?.attachments?.length > 0 && (
        <div className="flex flex-col items-start gap-2 w-full">
          <TypographyBodySemibold className="text-muted-foreground">
            Attachments
          </TypographyBodySemibold>

          {/* Attachments */}
          <div className="flex flex-col items-start gap-2 w-full">
            {item.template?.attachments.map((attachment, index) => (
              <div key={index} className="flex flex-row items-center gap-2 w-full">
                <TypographyBodyMedium
                  className="flex-1 truncate cursor-pointer text-foreground hover:text-brand-primary transition-colors"
                  onClick={() => {
                    window.open(attachment.url, '_blank')
                  }}
                >
                  {attachment.fileName}
                </TypographyBodyMedium>

                <TypographyBody className="text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </TypographyBody>
              </div>
            ))}
          </div>
        </div>
      )}
      {item?.agent && onCampaignStatClick && isEmail && (
        <div className="flex w-full justify-between items-center mt-2 gap-2 relative">
          <span className="text-[12px] text-gray-500 italic min-w-0">
            {item.openedAt != null
              ? `Opened at ${moment(item.openedAt).format('h:mm A')}`
              : '—'}
            {' · '}
            {item.clicked ?? 0} click{(item.clicked ?? 0) !== 1 ? 's' : ''}
          </span>
          <span
            className="relative inline-block shrink-0"
            onMouseEnter={(e) => {
              e.stopPropagation()
              onCampaignStatClick(item)
            }}
            onMouseLeave={(e) => {
              e.stopPropagation()
              onCampaignStatMouseLeave?.()
            }}
          >
            <button
              type="button"
              className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-black/5"
              aria-label="Campaign stat"
            >
              <BarChart2 size={15} />
            </button>
            {campaignStatAnchorActivityId === item.id && (
              <div
                className={`absolute z-50 w-auto min-w-[200px] max-w-[90vw] rounded-lg border border-[#1515151A10] shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white text-gray-900 ${
                  isLastActivityItem
                    ? 'bottom-full mb-1 right-0'
                    : 'top-full mt-1 right-0'
                }`}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation()
                  onCampaignStatMouseLeave?.()
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-2.5 py-2 border-b border-[#1515151A10]">
                  <span className="text-[12px] font-medium text-[#666666]">Campaign Stat</span>
                </div>
                <div className="px-2.5 py-2 text-[12px] space-y-1">
                  {campaignStatLoading ? (
                    <p className="text-muted-foreground text-[#666666] text-[14px]">Loading…</p>
                  ) : campaignStatData ? (
                    <div className="space-y-2 text-[12px]">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[#666666]">{campaignStatData.delivered} Delivered</span>
                        <span className="font-medium">
                          {campaignStatData.sent
                            ? `${Math.round((campaignStatData.delivered / campaignStatData.sent) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[#666666]">{campaignStatData.opened} Opened</span>
                        <span className="font-medium">
                          {campaignStatData.sent
                            ? `${Math.round((campaignStatData.opened / campaignStatData.sent) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[#666666]">{campaignStatData.clicked} Clicked</span>
                        <span className="font-medium">
                          {campaignStatData.sent
                            ? `${Math.round((campaignStatData.clicked / campaignStatData.sent) * 100)}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    !campaignStatLoading && (
                      <p className="text-muted-foreground">No data available.</p>
                    )
                  )}
                </div>
              </div>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

export default EmailSmsTranscriptCN

