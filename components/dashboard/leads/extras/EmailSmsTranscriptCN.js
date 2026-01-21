'use client'

import React from 'react'

import {
  TypographyBody,
  TypographyBodySemibold,
  TypographyBodyMedium,
  TypographyCaption,
} from '@/lib/typography'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'

const EmailSmsTranscriptCN = ({ item }) => {
  return (
    <div className="flex flex-col items-start gap-2 text-sm">
      {item.sentSubject && (
        <div className="flex flex-row items-center gap-1">
          <TypographyBodySemibold className="text-muted-foreground">
            Subject:
          </TypographyBodySemibold>
          <TypographyBodyMedium className="text-foreground">{item.sentSubject}</TypographyBodyMedium>
         
        </div>
      )}
      {item.sentContent && (
        <div className="flex flex-col items-start gap-2 w-full">
          <TypographyCaption className="whitespace-pre-wrap break-words text-foreground leading-normal">
            {(() => {
              let content = item.sentContent
              
              if (!content || typeof content !== 'string') {
                return ''
              }
              
              // First, unescape any HTML entities (like &lt; becomes <)
              if (content.includes('&lt;') || content.includes('&gt;') || content.includes('&amp;')) {
                if (typeof document !== 'undefined') {
                  const tempDiv = document.createElement('div')
                  tempDiv.innerHTML = content
                  content = tempDiv.textContent || tempDiv.innerText || content
                } else {
                  // SSR fallback: manually unescape
                  content = content
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&nbsp;/g, ' ')
                }
              }
              
              // Now convert HTML to plain text (strips <p>, <div>, etc. tags)
              return htmlToPlainText(content)
            })()}
          </TypographyCaption>
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
    </div>
  );
}

export default EmailSmsTranscriptCN

