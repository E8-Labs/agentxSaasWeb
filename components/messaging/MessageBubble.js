import moment from 'moment'
import { linkifyText } from '@/utilities/textUtils'
import AttachmentList from './AttachmentList'

const MessageBubble = ({ message, isOutbound, onAttachmentClick }) => (
  <div className="flex flex-col">
    <div
      className={`px-4 py-2 ${isOutbound
        ? 'text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl'
        : 'bg-gray-100 text-black rounded-tr-2xl rounded-bl-2xl rounded-br-2xl'
        }`}
      style={isOutbound ? { backgroundColor: 'hsl(var(--brand-primary))' } : {}}
    >
      <div
        className={`prose prose-sm max-w-none break-words whitespace-pre-wrap ${isOutbound
          ? 'text-white [&_h2]:!text-white [&_h3]:!text-white [&_h4]:!text-white [&_p]:!text-white [&_strong]:!text-white [&_em]:!text-white [&_a]:!text-white [&_a:hover]:!text-white/80 [&_ul]:!text-white [&_ol]:!text-white [&_li]:!text-white [&_span]:!text-white [&_*]:!text-white'
          : 'text-black'
          }`}
        style={isOutbound ? { color: 'white' } : {}}
        dangerouslySetInnerHTML={{ __html: linkifyText(message.content || '') }}
      />
      <AttachmentList message={message} isOutbound={isOutbound} onAttachmentClick={onAttachmentClick} />
    </div>
    <div className="flex items-center justify-end gap-2 mt1 mr-1">
      <span className={`text-[10px] text-[#00000060]`}>{moment(message.createdAt).format('h:mm A')}</span>
    </div>
  </div>
)

export default MessageBubble
