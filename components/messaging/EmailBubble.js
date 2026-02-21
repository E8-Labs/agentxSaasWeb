import moment from 'moment'
import { sanitizeAndLinkifyHTML } from '@/utilities/textUtils'
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
}) => (
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
            className="font-normal cursor-pointer text-xs relative"
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
            {openEmailDetailId === message.id && (
              <div
                className={`absolute z-50 w-auto min-w-fit max-w-[90vw] rounded-lg shadow-lg border border-gray-200 bg-white text-gray-900 ${isLastMessage
                  ? `bottom-full mb-1 ${isOutbound ? 'right-full mr-2' : 'left-full ml-2'}`
                  : `top-full mt-1 ${isOutbound ? 'right-full mr-2' : 'left-full ml-2'}`
                  }`}
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
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
                {(() => {
                  const details = getEmailDetails(message)
                  const rows = [
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

                  return (
                    <div className="px-2.5 py-2 text-[11px] text-gray-600 space-y-1">
                      {rows.length === 0 ? (
                        <div className="text-[10px] text-gray-400">No metadata available.</div>
                      ) : (
                        rows.map((row) => (
                          <div key={row.label} className="flex items-start gap-2">
                            <span className="text-gray-500 capitalize whitespace-nowrap min-w-[60px] text-[11px]">{row.label}:</span>
                            <span className="text-gray-700 break-words text-left text-[11px] leading-relaxed">{row.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
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
            className="hover:underline cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis max-w-full flex-1 ml-1 text-xs text-black"
            title={message.subject}
          >
            {message.subject}
          </div>
        </div>
      )}
      <div
        className={`prose prose-sm max-w-none break-words
          [&_p]:!mt-0 [&_p]:!mb-[0.35em] [&_p]:!leading-snug
          [&_ul]:!my-[0.35em] [&_ul]:!pl-[1.25em] [&_ul]:!list-disc
          [&_ol]:!my-[0.35em] [&_ol]:!pl-[1.25em]
          [&_li]:!my-[0.15em]
          ${isOutbound
          ? 'text-black [&_h2]:!text-black [&_h3]:!text-black [&_h4]:!text-black [&_p]:!text-black [&_strong]:!text-black [&_em]:!text-black [&_a]:!text-brand-primary [&_a:hover]:!opacity-80 [&_ul]:!text-black [&_ol]:!text-black [&_li]:!text-black [&_span]:!text-black [&_*]:!text-black'
          : 'text-black'
          }`}
        style={isOutbound ? { color: 'black' } : {}}
        dangerouslySetInnerHTML={{
          __html: (() => {
            const content = message.content || ''
            // Use formatting-preserving sanitizer when available (keeps bold, lists, links)
            if (sanitizeHTMLForEmailBody) {
              return sanitizeHTMLForEmailBody(content)
            }
            // Fallback: plain text linkify and line breaks
            return sanitizeAndLinkifyHTML(content, sanitizeHTML)
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

export default EmailBubble
