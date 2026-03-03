import React, { useEffect, useRef, useState } from 'react'
import { Paperclip, Image as ImageIcon, Microphone, MapPin, Play, Pause, VideoCamera } from '@phosphor-icons/react'

function formatDuration(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

const isImageAttachment = (attachment) => {
  const t = (attachment.type || '').toLowerCase()
  if (t === 'image') return true
  if (attachment.mimeType?.startsWith('image/')) return true
  if (attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) return true
  return false
}

const isVideoAttachment = (attachment) => {
  const t = (attachment.type || '').toLowerCase()
  if (t === 'audio') return false
  if (t === 'video' || t === 'reel' || t === 'ig_reel' || t === 'ephemeral') return true
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

function SocialVideoPlayer({ attachment, message, idx, getPlayableUrl, displayName, sizeLabel, textMuted }) {
  const [playableUrl, setPlayableUrl] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const hasUrl = attachment?.url
  const needsProxy = hasUrl && attachment.url.includes('lookaside.fbsbx.com')

  useEffect(() => {
    setLoadError(false)
  }, [attachment?.url, message?.id, idx])

  useEffect(() => {
    if (!hasUrl) {
      setPlayableUrl(null)
      return
    }
    if (!needsProxy) {
      setPlayableUrl(attachment.url)
      return
    }
    if (!getPlayableUrl || !message?.id) {
      setPlayableUrl(attachment.url)
      return
    }
    let revoked = false
    getPlayableUrl(attachment, message, idx)
      .then((url) => {
        if (!revoked && url) setPlayableUrl(url)
      })
      .catch(() => {
        if (!revoked) setPlayableUrl(attachment.url)
      })
    return () => {
      revoked = true
    }
  }, [attachment?.url, message?.id, idx, needsProxy])
  useEffect(() => {
    if (!playableUrl || !needsProxy) return
    return () => {
      try {
        URL.revokeObjectURL(playableUrl)
      } catch (_) { }
    }
  }, [playableUrl, needsProxy])

  const src = needsProxy ? playableUrl : attachment?.url

  if (!hasUrl) {
    return (
      <div className="flex flex-col gap-1 max-w-[320px]">
        <div className="rounded-lg w-full max-h-[240px] flex flex-col items-center justify-center text-gray-500 py-8 px-4 min-h-[120px]">
          <VideoCamera size={32} className="mb-2 opacity-70" />
          <span className="text-sm">Video</span>
          <span className="text-xs mt-1">Unavailable to play</span>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-1 max-w-[320px]">
        <div className="rounded-lg w-full max-h-[240px] flex flex-col items-center justify-center text-gray-500 py-8 px-4 min-h-[120px]">
          <VideoCamera size={32} className="mb-2 opacity-70" />
          <span className="text-sm">Video couldn’t load</span>
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs mt-2 text-brand-primary hover:underline"
            >
              Open in new tab
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 max-w-[320px]">
      {src ? (
        <video
          src={src}
          controls
          playsInline
          className="rounded-lg w-full max-h-[240px] object-contain"
          preload="metadata"
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="rounded-lg w-full max-h-[240px] flex items-center justify-center text-sm text-gray-500 py-8 min-h-[120px]">
          Loading video…
        </div>
      )}
    </div>
  )
}

function SocialAudioPlayer({ attachment, message, idx, getPlayableUrl, textMuted, isOutbound }) {
  const audioRef = useRef(null)
  const [playableUrl, setPlayableUrl] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const needsProxy = attachment?.url && attachment.url.includes('lookaside.fbsbx.com')

  useEffect(() => {
    if (!attachment?.url) {
      setPlayableUrl(null)
      return
    }
    if (!needsProxy) {
      setPlayableUrl(attachment.url)
      return
    }
    if (!getPlayableUrl || !message?.id) {
      setPlayableUrl(attachment.url)
      return
    }
    let revoked = false
    getPlayableUrl(attachment, message, idx)
      .then((url) => {
        if (!revoked && url) setPlayableUrl(url)
      })
      .catch(() => {
        if (!revoked) setPlayableUrl(attachment.url)
      })
    return () => {
      revoked = true
    }
  }, [attachment?.url, message?.id, idx, needsProxy])
  useEffect(() => {
    if (!playableUrl || !needsProxy) return
    return () => {
      try {
        URL.revokeObjectURL(playableUrl)
      } catch (_) { }
    }
  }, [playableUrl, needsProxy])

  const src = needsProxy ? playableUrl : attachment?.url

  useEffect(() => {
    const el = audioRef.current
    if (!el || !src) return
    const onTimeUpdate = () => setCurrentTime(el.currentTime)
    const onDurationChange = () => setDuration(el.duration)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('durationchange', onDurationChange)
    el.addEventListener('ended', onEnded)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    if (el.duration && !Number.isNaN(el.duration)) setDuration(el.duration)
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('durationchange', onDurationChange)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [src])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) el.play()
    else el.pause()
  }

  const onSeek = (e) => {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    el.currentTime = pct * duration
    setCurrentTime(el.currentTime)
  }

  if (!src) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0">
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="flex-1 h-1.5 bg-black/10 rounded-full max-w-[120px]" />
        <span className={`text-xs ${textMuted}`}>0:00</span>
      </div>
    )
  }

  const progress = duration > 0 ? currentTime / duration : 0
  const iconColor = isOutbound ? 'text-white' : 'text-gray-700'

  return (
    <div className="flex items-center gap-2 min-w-0 max-w-[220px]">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={togglePlay}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOutbound ? 'bg-white/25 hover:bg-white/35' : 'bg-gray-200 hover:bg-gray-300'}`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={16} weight="fill" className={iconColor} />
        ) : (
          <Play size={16} weight="fill" className={iconColor} style={{ marginLeft: 2 }} />
        )}
      </button>
      <button
        type="button"
        onClick={onSeek}
        className="flex-1 min-w-0 flex items-center h-2 group"
      >
        <div className="w-full h-1 rounded-full bg-black/15 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-75 ${isOutbound ? 'bg-white' : 'bg-gray-600'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </button>
      <span className={`flex-shrink-0 text-xs tabular-nums ${textMuted}`}>
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </span>
    </div>
  )
}

const AttachmentList = ({ message, isOutbound, onAttachmentClick, getImageUrl, getPlayableUrl }) => {
  if (!message.metadata?.attachments || message.metadata.attachments.length === 0) return null

  return (
    <div
      className={`mt-3 flex flex-col gap-2`}
      // ${isOutbound ? 'text-black' : 'text-black'}
      style={{ color: 'black' }}
    >
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
        const textMuted = 'text-gray-500' //isOutbound ? 'text-white/70' : 'text-gray-500'
        const linkClass = 'text-brand-primary' //isOutbound ? 'text-white/90 hover:text-white' : 'text-brand-primary hover:underline'

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

        // Video: inline player (use proxy for Meta CDN URLs; show placeholder if no URL)
        if (isVideo) {
          return (
            <SocialVideoPlayer
              key={idx}
              attachment={attachment}
              message={message}
              idx={idx}
              getPlayableUrl={getPlayableUrl}
              displayName={displayName}
              sizeLabel={sizeLabel}
              textMuted={textMuted}
            />
          )
        }

        // Audio / voice message: inline player (use proxy for Meta CDN URLs)
        if (isAudio && attachment.url) {
          return (
            <SocialAudioPlayer
              key={idx}
              attachment={attachment}
              message={message}
              idx={idx}
              getPlayableUrl={getPlayableUrl}
              textMuted={textMuted}
              isOutbound={isOutbound}
            />
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
