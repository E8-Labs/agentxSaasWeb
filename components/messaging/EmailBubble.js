import { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import moment from 'moment'
import { sanitizeAndLinkifyHTML, simpleMarkdownToHtml } from '@/utilities/textUtils'
import { stripQuotedReplyFromContent } from '@/utils/stripQuotedReplyFromContent'
import { getBrandPrimaryHex } from '@/utilities/colorUtils'
import AttachmentList from './AttachmentList'

const EmailBubble = ({
  message,
  isOutbound,
  sanitizeHTML,
  sanitizeHTMLForEmailBody,
  openEmailDetailId,
  setOpenEmailDetailId,
  getEmailDetails,
  selectedThread,
  onOpenEmailTimeline,
  setShowEmailTimeline,
  setEmailTimelineLeadId,
  setEmailTimelineSubject,
  onAttachmentClick,
  onReplyClick,
  isLastMessage = false,
  updateComposerFromMessage,
}) => {
  const [linkColor, setLinkColor] = useState('#7902DF')
  const [detailPopoverRect, setDetailPopoverRect] = useState(null)
  const subjectTriggerRef = useRef(null)

  useEffect(() => {
    setLinkColor(getBrandPrimaryHex())
  }, [])

  const updateDetailPopoverPosition = useCallback(() => {
    if (typeof document === 'undefined' || !subjectTriggerRef.current) return null
    const rect = subjectTriggerRef.current.getBoundingClientRect()
    return { top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, width: rect.width, height: rect.height }
  }, [])

  useEffect(() => {
    if (openEmailDetailId !== message.id) {
      setDetailPopoverRect(null)
      return
    }
    setDetailPopoverRect(updateDetailPopoverPosition())
  }, [openEmailDetailId, message.id, updateDetailPopoverPosition])

  const isDetailOpen = openEmailDetailId === message.id
  const details = isDetailOpen ? getEmailDetails(message) : null
  const detailRows = details
    ? [
        { label: 'from', value: details.from },
        { label: 'to', value: details.to },
        { label: 'cc', value: details.cc },
        { label: 'bcc', value: details.bcc },
        { label: 'date', value: details.date },
        { label: 'subject', value: details.subject },
        { label: 'mailed-by', value: details.mailedBy },
        { label: 'signed-by', value: details.signedBy },
        { label: 'security', value: details.security },
      ].filter((row) => row.value)
    : []

  const portaledPopover =
    isDetailOpen &&
    detailPopoverRect &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        role="tooltip"
        className="fixed z-[9999] w-[15vw] rounded-lg shadow-lg border border-gray-200 bg-white text-gray-900"
        style={{
          boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
          ...(isLastMessage
            ? { bottom: `${window.innerHeight - detailPopoverRect.top + 4}px`, top: 'auto' }
            : { top: `${detailPopoverRect.bottom + 4}px` }),
          ...(isOutbound
            ? { right: `${window.innerWidth - detailPopoverRect.left + 8}px`, left: 'auto' }
            : { left: `${detailPopoverRect.right + 8}px`, right: 'auto' }),
        }}
        onMouseEnter={(e) => {
          e.stopPropagation()
          setOpenEmailDetailId(message.id)
        }}
        onMouseLeave={(e) => {
          e.stopPropagation()
          setOpenEmailDetailId(null)
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="px-2.5 py-2 border-b border-gray-200">
          <span className="text-[11px] font-medium text-gray-700">Message details</span>
        </div>
        <div className="px-2.5 py-2 text-[11px] text-gray-600 space-y-1">
          {detailRows.length === 0 ? (
            <div className="text-[10px] text-gray-400">No metadata available.</div>
          ) : (
            detailRows.map((row) => (
              <div key={row.label} className="flex items-start gap-2">
                <span className="text-gray-500 capitalize whitespace-nowrap min-w-[60px] text-[11px]">{row.label}:</span>
                <span className="text-gray-700 break-words text-left text-[11px] leading-relaxed">{row.value}</span>
              </div>
            ))
          )}
        </div>
      </div>,
      document.body
    )

  return (
  <>
    <div
      className={`px-4 py-2 ${isOutbound
        ? 'text-black rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
        : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
        }`}
      style={isOutbound ? { backgroundColor: 'hsl(var(--brand-primary) / 0.05)' } : {}}
    >
      {message.subject && (
        <div className="font-semibold mb-2 flex items-start">
          <span
            ref={subjectTriggerRef}
            className="font-normal cursor-pointer text-[14px] relative"
            onMouseEnter={(e) => {
              e.stopPropagation()
              setOpenEmailDetailId(message.id)
            }}
            onMouseLeave={(e) => {
              e.stopPropagation()
              setOpenEmailDetailId(null)
            }}
          >
            Subject:
            {portaledPopover}
          </span>
          <div
            onClick={(e) => {
              e.stopPropagation()
              // Update composer fields from this message when subject is clicked
              if (updateComposerFromMessage && message.messageType === 'email') {
                updateComposerFromMessage(message)
              }
              if (onOpenEmailTimeline) {
                onOpenEmailTimeline(message.subject || null, message)
              } else if (setShowEmailTimeline && setEmailTimelineLeadId && selectedThread?.lead?.id) {
                setShowEmailTimeline(true)
                setEmailTimelineLeadId(selectedThread.lead.id)
                if (setEmailTimelineSubject && message.subject) {
                  setEmailTimelineSubject(message.subject)
                }
              }
            }}
            className="hover:underline cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 ml-1 text-[14px] text-black"
            title={message.subject}
          >
            {message.subject}
          </div>
        </div>
      )}
      <div
        className={`prose prose-sm max-w-none break-words
          [&_p]:!mt-0 [&_p]:!mb-[0.2em] [&_p]:!leading-snug
          [&_ul]:!my-[0.2em] [&_ul]:!pl-[1.15em] [&_ul]:!list-disc
          [&_ol]:!my-[0.2em] [&_ol]:!pl-[1.15em]
          [&_li]:!my-[0.08em]
          [&_a]:underline [&_a]:![color:var(--message-link-color)] hover:[&_a]:opacity-80
          ${isOutbound
          ? 'text-black [&_h2]:!text-black [&_h3]:!text-black [&_h4]:!text-black [&_p]:!text-black [&_strong]:!text-black [&_em]:!text-black [&_a:hover]:!opacity-80 [&_ul]:!text-black [&_ol]:!text-black [&_li]:!text-black [&_span]:!text-black [&_*]:!text-black'
          : 'text-black'
          }`}
        style={isOutbound ? { color: 'black', ['--message-link-color']: linkColor } : { ['--message-link-color']: linkColor }}
        dangerouslySetInnerHTML={{
          __html: (() => {
            const raw = message.content || ''
            const stripped = stripQuotedReplyFromContent(raw)
            const withMarkdown = simpleMarkdownToHtml(stripped)
            if (sanitizeHTMLForEmailBody) {
              return sanitizeHTMLForEmailBody(withMarkdown)
            }
            return sanitizeAndLinkifyHTML(withMarkdown, sanitizeHTML)
          })(),
        }}
      />

      <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} />


    </div>
    <div className="mt-1 mr-1 flex items-center justify-end gap-3">
      <span className={`text-[12px] text-[#00000060]`}>{moment(message.createdAt).format('h:mm A')}</span>
    </div>
  </>
  )
}

export default EmailBubble
