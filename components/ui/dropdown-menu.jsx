'use client'

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight, Circle } from 'lucide-react'
import * as React from 'react'

import { AgentationDialogContext } from '@/components/providers/agentation-dialog-provider'
import { PortalZIndexContext } from '@/components/providers/portal-z-index-provider'
import { cn } from '@/lib/utils'

/** True if target is inside Agentation toolbar, popup, or marker (prevents dropdown close when annotating) */
function isAgentationTarget(target) {
  return (
    target?.closest?.('[data-feedback-toolbar]') != null ||
    target?.closest?.('[data-annotation-popup]') != null ||
    target?.closest?.('[data-annotation-marker]') != null
  )
}

/** True if target is inside the content */
function isInsideContent(contentRef, target) {
  return contentRef?.current?.contains?.(target) === true
}

/** DropdownMenu root – uses modal={false} when Agentation is active so focus can reach the annotation input */
function DropdownMenu(props) {
  const useModalFalse = React.useContext(AgentationDialogContext)
  const modal = props.modal !== undefined ? props.modal : !useModalFalse
  return <DropdownMenuPrimitive.Root {...props} modal={modal} />
}

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef(
  ({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        'flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        inset && 'pl-8',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  ),
)
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

function createOutsideHandlers(contentRef, onInteractOutside, onPointerDownOutside) {
  return {
    onPointerDownOutside: (e) => {
      if (isAgentationTarget(e.target) || isInsideContent(contentRef, e.target)) e.preventDefault()
      onPointerDownOutside?.(e)
    },
    onInteractOutside: (e) => {
      if (isAgentationTarget(e.target) || isInsideContent(contentRef, e.target)) e.preventDefault()
      onInteractOutside?.(e)
    },
  }
}

const DropdownMenuSubContent = React.forwardRef(
  ({ className, onInteractOutside, onPointerDownOutside, style, ...props }, ref) => {
    const contentRef = React.useRef(null)
    const portalZIndex = React.useContext(PortalZIndexContext)
    const setRef = React.useCallback(
      (el) => {
        contentRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      },
      [ref],
    )
    const handlers = React.useMemo(
      () => createOutsideHandlers(contentRef, onInteractOutside, onPointerDownOutside),
      [onInteractOutside, onPointerDownOutside],
    )
    const resolvedZIndex =
      portalZIndex != null ? portalZIndex : (style?.zIndex ?? 2000)
    const contentStyle = { ...style, zIndex: resolvedZIndex }
    return (
      <DropdownMenuPrimitive.SubContent
        ref={setRef}
        className={cn(
          'min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        style={contentStyle}
        {...handlers}
        {...props}
      />
    )
  },
)
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef(
  ({ className, sideOffset = 4, avoidCollisions, onInteractOutside, onPointerDownOutside, style, ...props }, ref) => {
    const contentRef = React.useRef(null)
    const portalZIndex = React.useContext(PortalZIndexContext)
    const setRef = React.useCallback(
      (el) => {
        contentRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      },
      [ref],
    )
    const handlers = React.useMemo(
      () => createOutsideHandlers(contentRef, onInteractOutside, onPointerDownOutside),
      [onInteractOutside, onPointerDownOutside],
    )
    const resolvedZIndex =
      portalZIndex != null ? portalZIndex : (style?.zIndex ?? 2000)
    const contentStyle = { ...style, zIndex: resolvedZIndex }
    return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={setRef}
        sideOffset={sideOffset}
        avoidCollisions={avoidCollisions}
        className={cn(
          'min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[side=left]:data-[state=closed]:zoom-out-95 data-[side=left]:data-[state=open]:zoom-in-95 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:data-[state=closed]:zoom-out-95 data-[side=right]:data-[state=open]:zoom-in-95 data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:data-[state=closed]:zoom-out-95 data-[side=top]:data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2',
          'data-[side=bottom]:data-[state=open]:animate-dropdown-below-enter data-[side=bottom]:data-[state=closed]:animate-dropdown-below-exit',
          className,
        )}
        style={contentStyle}
        {...handlers}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
    )
  },
)
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  ),
)
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef(
  ({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  ),
)
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(
        'group relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-[14px] outline-none transition-all duration-150 ease-out',
        'focus:bg-black/[0.04] focus:text-foreground hover:bg-black/[0.04]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'data-[state=checked]:text-foreground',
        className,
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <span className="h-4 w-4 rounded-full border-2 border-black/[0.15] bg-white transition-all duration-150 ease-out group-hover:border-black/[0.25] group-data-[state=checked]:border-brand-primary group-data-[state=checked]:bg-brand-primary group-data-[state=checked]:group-hover:border-brand-primary" />
        <DropdownMenuPrimitive.ItemIndicator className="absolute flex items-center justify-center">
          <Circle className="h-2 w-2 fill-white text-white" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  ),
)
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef(
  ({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        className,
      )}
      {...props}
    />
  ),
)
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef(
  ({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  ),
)
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({ className, ...props }) => {
  return (
    <span
      className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut'

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
