'use client'

import React from 'react'

import {
  TypographyBody,
  TypographyBodySemibold,
  TypographyBodyMedium,
} from '@/lib/typography'
import { htmlToPlainText, formatFileSize } from '@/utilities/textUtils'

const EmailSmsTranscriptCN = ({ item }) => {
  return (
    <div className="flex flex-col items-start gap-2">
      {item.sentSubject && (
        <TypographyBodySemibold>Subject: {item.sentSubject}</TypographyBodySemibold>
      )}

      {item.sentContent && (
        <div className="flex flex-col items-start gap-2">
          <TypographyBodyMedium className="whitespace-pre-wrap">
            {htmlToPlainText(item.sentContent)}
          </TypographyBodyMedium>
        </div>
      )}

      {item.template?.attachments?.length > 0 && (
        <div className="flex flex-col items-start gap-2">
          <TypographyBodySemibold className="text-muted-foreground">
            Attachments
          </TypographyBodySemibold>

          {/* Attachments */}
          {item.template?.attachments.map((attachment, index) => (
            <div key={index} className="flex flex-row items-center gap-2">
              <TypographyBodyMedium
                className="w-6/12 truncate cursor-pointer"
                onClick={() => {
                  window.open(attachment.url, '_blank')
                }}
              >
                {attachment.fileName}
              </TypographyBodyMedium>

              <TypographyBody>{formatFileSize(attachment.size)}</TypographyBody>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmailSmsTranscriptCN

