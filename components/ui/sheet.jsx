'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { AgentationDialogContext } from '@/components/providers/agentation-dialog-provider'

/** Sheet root – uses modal={false} when Agentation is active so focus can reach the annotation input */
function Sheet(props) {
  const useModalFalse = React.useContext(AgentationDialogContext)
  const modal = props.modal !== undefined ? props.modal : !useModalFalse
  return <DialogPrimitive.Root {...props} modal={modal} />
}

const SheetTrigger = DialogPrimitive.Trigger

const SheetClose = DialogPrimitive.Close

const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      'fixed inset-0 z-[50] bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const sheetVariants = cva(
  'fixed z-[51] gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
      },
    },
    defaultVariants: {
      side: 'right',
    },
  },
)

/** True if target is inside Agentation toolbar, popup, or marker (prevents modal close when annotating) */
function isAgentationTarget(target) {
  return (
    target?.closest?.('[data-feedback-toolbar]') != null ||
    target?.closest?.('[data-annotation-popup]') != null ||
    target?.closest?.('[data-annotation-marker]') != null ||
    target?.closest?.('[data-agentation-fallback-overlay]') != null
  )
}

/** True if target is inside the sheet content */
function isInsideContent(contentRef, target) {
  return contentRef?.current?.contains?.(target) === true
}

const SheetContent = React.forwardRef(
  ({ side = 'right', className, overlayClassName, children, onInteractOutside, onPointerDownOutside, onFocusOutside, ...props }, ref) => {
    const contentRef = React.useRef(null)
    const useModalFalse = React.useContext(AgentationDialogContext)
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
    const handleFocusOutside = React.useCallback(
      (e) => {
        if (isAgentationTarget(e.target) || isInsideContent(contentRef, e.target)) e.preventDefault()
        onFocusOutside?.(e)
      },
      [onFocusOutside],
    )
    // Extract z-index from className if present (e.g., z-[1400] or !z-[1400])
    const zIndexMatch = className?.match(/(?:!)?z-\[(\d+)\]/)
    const customZIndex = zIndexMatch ? zIndexMatch[1] : null
    const overlayZIndex = customZIndex ? `!z-[${parseInt(customZIndex) - 1}]` : null
    
    return (
      <SheetPortal>
        <SheetOverlay className={cn(overlayZIndex, overlayClassName)} />
        {useModalFalse && (
          <div
            data-agentation-fallback-overlay
            className={cn(
              'fixed inset-0 z-[50] bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              overlayZIndex,
              overlayClassName
            )}
            aria-hidden
          />
        )}
        <DialogPrimitive.Content
          ref={setRef}
          className={cn(sheetVariants({ side }), className)}
          trapFocus={false}
          onInteractOutside={handleInteractOutside}
          onPointerDownOutside={handlePointerDownOutside}
          onFocusOutside={handleFocusOutside}
          {...props}
          trapFocus={false}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </SheetPortal>
    )
  },
)
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = DialogPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}

