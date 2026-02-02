import { Paperclip } from '@phosphor-icons/react'

const AttachmentList = ({ message, isOutbound, onAttachmentClick }) => {
  if (!message.metadata?.attachments || message.metadata.attachments.length === 0) return null

  return (
    <div className={`mt-3 flex flex-col gap-2 ${isOutbound ? 'text-white' : 'text-black'}`}>
      {message.metadata.attachments.map((attachment, idx) => {
        const isImage =
          attachment.mimeType?.startsWith('image/') ||
          attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)

        const enrichedAttachment = {
          ...attachment,
          downloadData: attachment.downloadData || {
            messageId: attachment.messageId || message.emailMessageId,
            attachmentId: attachment.attachmentId,
            emailAccountId: attachment.emailAccountId || message.emailAccountId,
          },
          messageId: attachment.messageId || attachment.downloadData?.messageId || message.emailMessageId,
          attachmentId: attachment.attachmentId || attachment.downloadData?.attachmentId,
          emailAccountId: attachment.emailAccountId || attachment.downloadData?.emailAccountId || message.emailAccountId,
        }

        return (
          <button
            key={idx}
            onClick={(e) => {
              e.preventDefault()
              onAttachmentClick(enrichedAttachment, message, isImage)
            }}
            className={`text-sm flex items-center gap-2 hover:opacity-80 text-left ${isOutbound ? 'text-white/90' : 'text-brand-primary'
              }`}
          >
            <Paperclip size={14} />
            <span className="underline">
              {enrichedAttachment.originalName || enrichedAttachment.fileName || `Attachment ${idx + 1}`}
            </span>
            {enrichedAttachment.size && (
              <span className={`text-xs ${isOutbound ? 'text-white/70' : 'text-gray-500'}`}>
                ({(enrichedAttachment.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </button>
        )
      })}
    </div>
  );
}

export default AttachmentList
