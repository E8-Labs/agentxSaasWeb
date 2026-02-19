'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'

import CloseBtn from '@/components/globalExtras/CloseBtn'
import { cn } from '@/lib/utils'
import { AgentationDialogContext } from '@/components/providers/agentation-dialog-provider'

/** Dialog root – uses modal={false} when Agentation is active so focus can reach the annotation input */
function Dialog(props) {
  const useModalFalse = React.useContext(AgentationDialogContext)
  const modal = props.modal !== undefined ? props.modal : !useModalFalse
  return <DialogPrimitive.Root {...props} modal={modal} />
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-[1400] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/** True if target is inside Agentation toolbar, popup, or marker (prevents modal close when annotating) */
function isAgentationTarget(target) {
  return (
    target?.closest?.('[data-feedback-toolbar]') != null ||
    target?.closest?.('[data-annotation-popup]') != null ||
    target?.closest?.('[data-annotation-marker]') != null ||
    target?.closest?.('[data-agentation-fallback-overlay]') != null
  )
}

/** True if target is inside the dialog content */
function isInsideDialogContent(contentRef, target) {
  return contentRef?.current?.contains?.(target) === true
}

const DialogContent = React.forwardRef(
  ({ className, overlayClassName, children, onInteractOutside, onEscapeKeyDown, onPointerDownOutside, onFocusOutside, trapFocus = false, hideCloseButton, ...props }, ref) => {
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
        if (isAgentationTarget(e.target) || isInsideDialogContent(contentRef, e.target)) e.preventDefault()
        onPointerDownOutside?.(e)
      },
      [onPointerDownOutside],
    )
    const handleInteractOutside = React.useCallback(
      (e) => {
        if (isAgentationTarget(e.target) || isInsideDialogContent(contentRef, e.target)) e.preventDefault()
        onInteractOutside?.(e)
      },
      [onInteractOutside],
    )
    const handleFocusOutside = React.useCallback(
      (e) => {
        if (isAgentationTarget(e.target) || isInsideDialogContent(contentRef, e.target)) e.preventDefault()
        onFocusOutside?.(e)
      },
      [onFocusOutside],
    )
    return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      {useModalFalse && (
        <div
          data-agentation-fallback-overlay
          className={cn(
            'fixed inset-0 z-[1400] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            overlayClassName
          )}
          aria-hidden
        />
      )}
      <DialogPrimitive.Content
        ref={setRef}
        className={cn(
          'fixed left-[50%] top-[50%] z-[1401] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-hidden flex flex-col',
          className,
        )}
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={handlePointerDownOutside}
        onFocusOutside={handleFocusOutside}
        trapFocus={trapFocus}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close asChild>
            <CloseBtn aria-label="Close" className="absolute right-4 top-4 z-10" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
    )
  },
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
