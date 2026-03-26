'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'

/** Seek to show a decoded frame; some hosts/CDNs may block preview (falls back to static art). */
const PREVIEW_SEEK_SEC = 0.08

/**
 * Formats duration string to mm:ss format
 * Handles formats like:
 * - "16 min 30 sec" -> "16:30"
 * - "1:41" or "01:52" (already mm:ss) -> passed through
 */
const formatDuration = (duration) => {
  if (!duration || typeof duration !== 'string') {
    return duration || '0:00'
  }
  const trimmed = duration.trim()
  if (/^\d{1,3}:\d{1,2}$/.test(trimmed)) {
    const [m, s] = trimmed.split(':')
    return `${parseInt(m, 10)}:${s.padStart(2, '0')}`
  }

  const minMatch = trimmed.match(/(\d+)\s*(?:min|mins|minute|minutes)/i)
  const secMatch = trimmed.match(/(\d+)\s*(?:sec|secs|second|seconds)/i)

  const minutes = minMatch ? parseInt(minMatch[1], 10) : 0
  const seconds = secMatch ? parseInt(secMatch[1], 10) : 0

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function VideoPreviewThumb({ videoUrl, fallbackWidth, fallbackHeight }) {
  const [failed, setFailed] = useState(false)
  const [frameReady, setFrameReady] = useState(false)

  const handleLoadedMetadata = useCallback((e) => {
    const v = e.currentTarget
    try {
      if (v.duration && !Number.isNaN(v.duration) && Number.isFinite(v.duration)) {
        v.currentTime = Math.min(
          PREVIEW_SEEK_SEC,
          Math.max(0.04, v.duration * 0.02),
        )
      } else {
        v.currentTime = PREVIEW_SEEK_SEC
      }
    } catch {
      setFailed(true)
    }
  }, [])

  const handleSeeked = useCallback(() => {
    setFrameReady(true)
  }, [])

  const handleLoadedData = useCallback(() => {
    window.setTimeout(() => setFrameReady(true), 150)
  }, [])

  if (!videoUrl || failed) {
    return (
      <Image
        src="/assets/youtubeplay.png"
        alt=""
        width={fallbackWidth}
        height={fallbackHeight}
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <>
      {!frameReady ? (
        <div
          className="absolute inset-0 animate-pulse bg-muted"
          aria-hidden
        />
      ) : null}
      <video
        src={videoUrl}
        muted
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          !frameReady && 'opacity-0',
        )}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onLoadedData={handleLoadedData}
        onError={() => setFailed(true)}
      />
    </>
  )
}

const VideoCard = ({
  playVideo,
  horizontal = true,
  title,
  duration = '2 mins',
  width = '60',
  height = '60',
  className,
  videoUrl = null,
  /** If true: collapse content until hover and animate width expand/shrink. */
  hoverReveal = false,
  /** If true: hide the CTA button entirely (useful for hover-reveal mini chip). */
  hideCta = false,
}) => {
  const formattedDuration = formatDuration(duration)
  const fw = parseInt(width, 10) || 60
  const fh = parseInt(height, 10) || 60

  const isStacked = horizontal === false && !hoverReveal

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border border-black/[0.06] bg-white p-3 text-left shadow-sm transition-all duration-150',
        'hover:border-brand-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40',
        hoverReveal
          ? 'group h-[90px] w-[156px] items-center overflow-hidden transition-[width] duration-300 ease-out hover:w-[400px]'
          : 'w-full',
        isStacked ? 'flex-col items-stretch' : 'flex-row items-stretch',
        className,
      )}
      onClick={() => {
        playVideo()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          playVideo()
        }
      }}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-lg bg-muted',
          hoverReveal
            ? 'h-[84px] w-[84px]'
            : isStacked
            ? 'aspect-video w-full max-h-[140px]'
            : 'aspect-video w-[min(112px,32vw)] max-w-[112px]',
        )}
      >
        <VideoPreviewThumb
          videoUrl={videoUrl}
          fallbackWidth={fw}
          fallbackHeight={fh}
        />
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <div className="rounded-full bg-black/50 p-2 text-white shadow-sm backdrop-blur-[2px]">
            <Play className="size-4 text-white" strokeWidth={2.5} aria-hidden />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5',
          hoverReveal
            ? 'max-w-0 opacity-0 transition-[max-width,opacity,transform] duration-200 ease-out group-hover:max-w-[420px] group-hover:opacity-100'
            : undefined,
        )}
      >
        <div
          className="flex items-start justify-between gap-2"
          style={{ alignItems: 'flex-start' }}
        >
          <h3 className="line-clamp-2 min-w-0 flex-1 text-[14px] font-normal leading-snug text-foreground">
            {title}
          </h3>
          <span className="shrink-0 rounded-full border border-black/[0.08] px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {formattedDuration}
          </span>
        </div>
        {hideCta ? null : (
          <div
            className={cn(
              'inline-flex h-9 max-w-full items-center justify-center gap-1.5 self-start rounded-lg px-3 text-xs font-semibold',
              'bg-brand-primary text-primary-foreground transition-all duration-150',
              'hover:opacity-90 active:scale-[0.98]',
              hoverReveal
                ? 'opacity-0 transition-opacity duration-200 group-hover:opacity-100'
                : undefined,
            )}
          >
            <Image
              src="/svgIcons/youtube.svg"
              height={16}
              width={16}
              alt=""
              className="opacity-90"
            />
            Show me how!
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoCard
