import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * Renders the platform/source icon for a message or thread (Facebook, Instagram, Email, SMS).
 * Messenger and Instagram use PNGs from public/svgIcons.
 * @param { 'messenger' | 'instagram' | 'email' | 'sms' } type - messageType or threadType
 * @param { object } props - optional className, size (number, default 14), showInBadge (wrap in white circle), badgeSize ('sm' | 'md')
 */
function PlatformIcon({ type, className, size = 14, showInBadge = false, badgeSize = 'md' }) {
  let sizePx = typeof size === 'number' ? size : 14
  if (type === 'email') sizePx = Math.round(sizePx * 1.5 * 1.6 * 0.9)
  else if (type === 'sms') sizePx = Math.round(sizePx * 1.5 * 1.6)
  if (showInBadge && badgeSize === 'sm') sizePx = Math.min(sizePx, 8)
  const isRoundedColored = type === 'messenger' || type === 'instagram'
  const badgeSizeClass = badgeSize === 'sm' ? 'w-4 h-4' : 'w-6 h-6'
  const badgeTranslate = showInBadge ? 'translate-y-[calc(50%-8px)]' : 'translate-y-1/2'
  const badgeClass =
    showInBadge && isRoundedColored
      ? `absolute bottom-0 right-0 ${badgeTranslate} ${badgeSizeClass} rounded-full flex items-center justify-center overflow-hidden shadow-sm border border-white`
      : showInBadge
        ? `absolute bottom-0 right-0 ${badgeTranslate} ${badgeSizeClass} rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden`
        : 'flex items-center justify-center flex-shrink-0'
  const wrapperClass = showInBadge ? badgeClass : 'flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden'

  const content = (() => {
    if (type === 'email') {
      return (
        <Image
          src="/messaging/email message type icon.svg"
          width={sizePx}
          height={sizePx}
          alt="Email"
          className="object-contain"
        />
      )
    }
    if (type === 'sms') {
      return (
        <Image
          src="/messaging/text type message icon.svg"
          width={sizePx}
          height={sizePx}
          alt="SMS"
          className="object-contain"
        />
      )
    }
    if (type === 'messenger') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/svgIcons/fb_message_icon.png"
          width={sizePx}
          height={sizePx}
          alt="Messenger"
          className="object-contain w-full h-full"
          aria-label="Messenger"
          style={{
            width: showInBadge ? '100%' : sizePx,
            height: showInBadge ? '100%' : sizePx,
          }}
        />
      )
    }
    if (type === 'instagram') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/svgIcons/insta_message_icon.png"
          width={sizePx}
          height={sizePx}
          alt="Instagram"
          className="object-contain w-full h-full"
          aria-label="Instagram"
          style={{
            width: showInBadge ? '100%' : sizePx,
            height: showInBadge ? '100%' : sizePx,
          }}
        />
      )
    }
    return null
  })()

  if (!content) return null

  return (
    <div
      className={cn(wrapperClass, className)}
      style={!showInBadge ? { width: sizePx, height: sizePx } : undefined}
    >
      {content}
    </div>
  )
}

export default PlatformIcon
