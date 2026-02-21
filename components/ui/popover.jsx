'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '@/lib/utils'

/** True if target is inside Agentation toolbar, popup, or marker (prevents popover close when annotating) */
function isAgentationTarget(target) {
  return (
    target?.closest?.('[data-feedback-toolbar]') != null ||
    target?.closest?.('[data-annotation-popup]') != null ||
    target?.closest?.('[data-annotation-marker]') != null
  )
}

/** True if target is inside the popover content */
function isInsideContent(contentRef, target) {
  return contentRef?.current?.contains?.(target) === true
}

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef(
  ({ className, align = 'center', sideOffset = 4, style, onInteractOutside, onPointerDownOutside, ...props }, ref) => {
    const contentRef = React.useRef(null)
    const setRef = React.useCallback(
      (el) => {
        contentRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      },
      [ref],
    )
    const handlePointerDownOutside = React.useCallback(
      (e) => {
        if (isAgentationTarget(e.target) || isInsideContent(contentRef, e.target)) e.preventDefault()
        onPointerDownOutside?.(e)
      },
      [onPointerDownOutside],
    )
    const handleInteractOutside = React.useCallback(
      (e) => {
        if (isAgentationTarget(e.target) || isInsideContent(contentRef, e.target)) e.preventDefault()
        onInteractOutside?.(e)
      },
      [onInteractOutside],
    )
    return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={setRef}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-2xl border border-[#eaeaea] bg-popover p-4 text-popover-foreground shadow-[0_8px_30px_rgba(0,0,0,0.12)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        style={{
          ...style,
          zIndex: style?.zIndex || 200,
          border: '1px solid #eaeaea',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.15)',
          borderRadius: 12,
        }}
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handlePointerDownOutside}
        {...props}
      />
    </PopoverPrimitive.Portal>
    )
  },
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
