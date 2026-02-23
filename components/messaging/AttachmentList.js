import { Paperclip, Image as ImageIcon, VideoCamera, Microphone, MapPin } from '@phosphor-icons/react'

const isImageAttachment = (attachment) => {
  const t = (attachment.type || '').toLowerCase()
  if (t === 'image') return true
  if (attachment.mimeType?.startsWith('image/')) return true
  if (attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return true
  return false
}

const isVideoAttachment = (attachment) => {
  const t = (attachment.type || '').toLowerCase()
  if (t === 'video' || t === 'reel' || t === 'ig_reel') return true
  if (attachment.mimeType?.startsWith('video/')) return true
  if (attachment.fileName?.match(/\.(mp4|webm|mov|ogv|avi)$/i)) return true
  return false
}

const isAudioAttachment = (attachment) => {
  const t = (attachment.type || '').toLowerCase()
  if (t === 'audio') return true
  if (attachment.mimeType?.startsWith('audio/')) return true
  if (attachment.fileName?.match(/\.(mp3|wav|ogg|m4a|webm)$/i)) return true
  return false
}

const isLocationAttachment = (attachment) => {
  const t = (attachment.type || '').toLowerCase()
  if (t === 'location') return true
  if (attachment.coordinates != null || (attachment.lat != null && attachment.long != null)) return true
  return false
}

const getLocationUrl = (attachment) => {
  if (attachment.url && typeof attachment.url === 'string') return attachment.url
  const lat = attachment.coordinates?.lat ?? attachment.lat
  const long = attachment.coordinates?.long ?? attachment.long ?? attachment.lng
  if (lat != null && long != null) {
    return `https://www.google.com/maps?q=${encodeURIComponent(lat)},${encodeURIComponent(long)}`
  }
  return null
}

const AttachmentList = ({ message, isOutbound, onAttachmentClick, getImageUrl }) => {
  if (!message.metadata?.attachments || message.metadata.attachments.length === 0) return null

  return (
    <div className={`mt-3 flex flex-col gap-2 ${isOutbound ? 'text-white' : 'text-black'}`}>
      {message.metadata.attachments.map((attachment, idx) => {
        const isImage = isImageAttachment(attachment)
        const isVideo = isVideoAttachment(attachment)
        const isAudio = isAudioAttachment(attachment)
        const isLocation = isLocationAttachment(attachment)

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

        const displayName = attachment.originalName || attachment.fileName || `Attachment ${idx + 1}`
        const sizeLabel = attachment.size ? `(${(attachment.size / 1024).toFixed(1)} KB)` : null
        const textMuted = isOutbound ? 'text-white/70' : 'text-gray-500'
        const linkClass = isOutbound ? 'text-white/90 hover:text-white' : 'text-brand-primary hover:underline'

        // Image: thumbnail, click opens lightbox
        if (isImage) {
          const thumbUrl = getImageUrl ? getImageUrl(enrichedAttachment, message) : attachment.url
          return (
            <div key={idx} className="flex flex-col gap-1">
              {thumbUrl ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onAttachmentClick(enrichedAttachment, message, true)
                  }}
                  className="rounded-lg overflow-hidden border border-black/10 max-w-[280px] max-h-[280px] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-primary"
                >
                  <img
                    src={thumbUrl}
                    alt={displayName}
                    className="w-full h-full object-cover block"
                    style={{ maxHeight: 280 }}
                  />
                </button>
              ) : (
                <div className={`flex items-center gap-2 text-sm ${linkClass}`}>
                  <ImageIcon size={16} />
                  <span className="underline">{displayName}</span>
                  {sizeLabel && <span className={`text-xs ${textMuted}`}>{sizeLabel}</span>}
                </div>
              )}
            </div>
          )
        }

        // Video: inline player
        if (isVideo && attachment.url) {
          return (
            <div key={idx} className="flex flex-col gap-1 max-w-[320px]">
              <video
                src={attachment.url}
                controls
                playsInline
                className="rounded-lg border border-black/10 w-full max-h-[240px] bg-black/5"
                preload="metadata"
              />
              {(displayName !== `Attachment ${idx + 1}` || sizeLabel) && (
                <div className={`text-xs ${textMuted}`}>
                  {displayName}
                  {sizeLabel && ` ${sizeLabel}`}
                </div>
              )}
            </div>
          )
        }

        // Audio / voice message: inline player
        if (isAudio && attachment.url) {
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Microphone size={18} className={isOutbound ? 'text-white/80' : 'text-gray-600'} />
                <span className="text-xs font-medium">Voice message</span>
              </div>
              <audio
                src={attachment.url}
                controls
                className="max-w-full h-9"
                preload="metadata"
              />
              {sizeLabel && <span className={`text-xs ${textMuted}`}>{sizeLabel}</span>}
            </div>
          )
        }

        // Location: link to map
        if (isLocation) {
          const mapUrl = getLocationUrl(attachment)
          return (
            <div key={idx} className="flex items-center gap-2">
              <MapPin size={16} className={isOutbound ? 'text-white/80' : 'text-brand-primary'} />
              {mapUrl ? (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm ${linkClass}`}
                >
                  View location
                </a>
              ) : (
                <span className="text-sm">Location shared</span>
              )}
            </div>
          )
        }

        // File / fallback: download link
        return (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onAttachmentClick(enrichedAttachment, message, false)
            }}
            className={`text-sm flex items-center gap-2 hover:opacity-80 text-left ${linkClass}`}
          >
            <Paperclip size={14} />
            <span className="underline">{displayName}</span>
            {sizeLabel && <span className={`text-xs ${textMuted}`}>{sizeLabel}</span>}
          </button>
        )
      })}
    </div>
  )
}

export default AttachmentList
