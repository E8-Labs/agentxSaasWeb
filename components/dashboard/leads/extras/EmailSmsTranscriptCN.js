'use client'

import React from 'react'

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

const EmailSmsTranscriptCN = ({ item }) => {
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
    <div className="flex flex-col items-start gap-2 text-sm">
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
    </div>
  );
}

export default EmailSmsTranscriptCN

