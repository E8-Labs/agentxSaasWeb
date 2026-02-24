import moment from 'moment'
import {
  linkifyText,
  sanitizeHTMLForEmailBody,
} from '@/utilities/textUtils'
import AttachmentList from './AttachmentList'

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

function getDisplayHtml(content) {
  if (!content || typeof content !== 'string') return ''
  let text = content
  if (text.includes('&lt;') || text.includes('&gt;') || text.includes('&amp;')) {
    text = unescapeHtmlEntities(text)
  }
  if (/<[^>]+>/.test(text)) {
    return sanitizeHTMLForEmailBody(text)
  }
  return linkifyText(text)
}

const ATTACHMENT_ONLY_PLACEHOLDER = /^\[\d+ (voice message|image|video|file)s?\]$|^\[\d+ (voice messages|images|videos|files)\]$/
function isAttachmentOnlyPlaceholder(content) {
  if (!content || typeof content !== 'string') return false
  return ATTACHMENT_ONLY_PLACEHOLDER.test(content.trim())
}

const MessageBubble = ({ message, isOutbound, onAttachmentClick, getImageUrl, getPlayableUrl }) => (
  <div className="flex flex-col">
    <div
      className={`px-4 py-2 ${isOutbound
        ? 'text-black rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
        : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
        }`}
      style={isOutbound ? { backgroundColor: 'hsl(var(--brand-primary) / 0.05)' } : {}}
    >
      <div
        className={`prose prose-sm max-w-none break-words
          [&_p]:!mt-0 [&_p]:!mb-[0.35em] [&_p]:!leading-snug
          [&_ul]:!my-[0.35em] [&_ul]:!pl-[1.25em] [&_ul]:!list-disc
          [&_ol]:!my-[0.35em] [&_ol]:!pl-[1.25em]
          [&_li]:!my-[0.15em]
          [&_a]:text-brand-primary [&_a]:underline hover:[&_a]:opacity-80
          text-black [&_h2]:!text-black [&_h3]:!text-black [&_h4]:!text-black [&_p]:!text-black [&_strong]:!text-black [&_em]:!text-black [&_a]:!text-brand-primary [&_a:hover]:!opacity-80 [&_ul]:!text-black [&_ol]:!text-black [&_li]:!text-black [&_span]:!text-black [&_*]:!text-black`}
        dangerouslySetInnerHTML={{
          __html: isAttachmentOnlyPlaceholder(message.content)
            ? ''
            : getDisplayHtml(message.content || ''),
        }}
      />
      <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} getImageUrl={getImageUrl} getPlayableUrl={getPlayableUrl} />
    </div>
    <div className="flex items-center justify-end gap-2 mt1 mr-1">
      <span className={`text-[12px] text-[#00000060]`}>{moment(message.createdAt).format('h:mm A')}</span>
    </div>
  </div>
)

export default MessageBubble
