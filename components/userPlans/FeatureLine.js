import { Info } from 'lucide-react'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const FeatureLine = ({
  text,
  info,
  max = 16,
  min = 10,
  gap = 4,
  iconSize = 12,
}) => {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [fontSize, setFontSize] = useState(max)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  // Initialize mobile detection synchronously to avoid controlled/uncontrolled switch
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      return isTouchDevice || isSmallScreen
    }
    return false
  })

  const fit = () => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    let size = max
    textEl.style.fontSize = `${size}px`

    // Reserve space for icon + gap if there's a tooltip
    const reserved = info ? iconSize + gap : 0
    const availableForText = Math.max(0, container.clientWidth - reserved)

    textEl.style.whiteSpace = 'nowrap'
    while (textEl.scrollWidth > availableForText && size > min) {
      size -= 0.5
      textEl.style.fontSize = `${size}px`
    }

    setFontSize(size)
  }

  useLayoutEffect(() => {
    fit()
    const ro = new ResizeObserver(fit)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [text, max, min, gap, iconSize, info])

  useEffect(() => {
    const onResize = () => fit()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Update mobile detection on resize
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isTouchDevice || isSmallScreen)
    }

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close tooltip when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !tooltipOpen) return

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setTooltipOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMobile, tooltipOpen])

  return (
    <div
      ref={containerRef}
      className="flex items-center w-full min-w-0"
      style={{ lineHeight: 1.35 }}
    >
      <span
        ref={textRef}
        style={{
          fontSize,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        className="min-w-0"
      >
        {text}
      </span>

      {info && (
        <TooltipProvider delayDuration={isMobile ? 0 : 200}>
          <Tooltip
            open={isMobile ? tooltipOpen : undefined}
            onOpenChange={isMobile ? setTooltipOpen : undefined}
          >
            <TooltipTrigger asChild>
              <div
                className="flex-shrink-0 inline-flex items-center justify-center cursor-pointer"
                style={{
                  width: iconSize,
                  height: iconSize,
                  marginLeft: gap,
                  transform: 'translateY(1px)',
                }}
                onClick={
                  isMobile
                    ? (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setTooltipOpen((t) => !t)
                      }
                    : undefined
                }
              >
                <Info size={14} className="opacity-80" aria-hidden />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[200px] rounded-lg bg-black px-3 py-2 text-xs font-medium text-white break-words"
            >
              {info}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export default FeatureLine
