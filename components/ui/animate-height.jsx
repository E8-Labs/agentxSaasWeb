'use client'

import React, { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

const DEFAULT_DURATION = 250
const DEFAULT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

/**
 * Wraps content and animates its container height when the content height changes
 * (e.g. switching modal steps or showing/hiding sections).
 * Uses ResizeObserver to measure content and CSS transition for smooth height changes.
 */
export function AnimateHeight({
  children,
  className,
  style = {},
  duration = DEFAULT_DURATION,
  easing = DEFAULT_EASING,
  as: Component = 'div',
}) {
  const contentRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height
        setHeight(h)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Component
      className={cn(className)}
      style={{
        height: height,
        overflow: 'hidden',
        transition: `height ${duration}ms ${easing}`,
        ...style,
      }}
    >
      <div ref={contentRef} style={{ width: '100%' }}>
        {children}
      </div>
    </Component>
  )
}
