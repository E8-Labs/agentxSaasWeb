'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/**
 * A pill-shaped split dropdown used across lead details (Send, Payment, Stage).
 * options: [{ label, icon, value, onSelect }]
 * chevronIcon: Optional custom icon component to replace the default ChevronDown
 * onChevronClick: Optional handler for when the chevron/icon is clicked (for split button behavior)
 */
const DropdownCn = ({ label, icon: Icon, options = [], onSelect, align = 'start', backgroundClassName, chevronIcon: ChevronIcon, onChevronClick, title, className, hideChevron = false, iconColor }) => {
  const [open, setOpen] = useState(false)
  const scrollContainerRef = useRef(null)

  const handleSelect = (opt) => {
    onSelect?.(opt)
    opt?.onSelect?.(opt)
    setOpen(false)
  }

  // Handle open change to prevent modal closing when dropdown closes
  const handleOpenChange = (newOpen, event) => {
    // Prevent event from propagating when toggling dropdown
    if (event) {
      event.stopPropagation()
    }
    setOpen(newOpen)
  }

  // Close dropdown on scroll to prevent floating issue
  useEffect(() => {
    if (!open) return

    const handleScroll = () => {
      setOpen(false)
    }

    // Find the scroll container (ScrollArea in Sheet)
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [open])

  const IconComponent = ChevronIcon || ChevronDown

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={handleOpenChange}>
        <div className={cn("flex items-center rounded-md border border-muted/0.9 bg-white shadow-sm", className)}>
          {onChevronClick ? (
            <>
              <DropdownMenuTrigger asChild>
                <button 
                  className={cn("flex items-center px-4 py-[1px] text-base font-regular focus:outline-none rounded-l-md hover:bg-muted/50 transition-colors h-[36px]", backgroundClassName)}
                  onMouseDown={(e) => {
                    // Prevent event from bubbling up to modal close handler
                    e.stopPropagation()
                  }}
                  onClick={(e) => {
                    // Prevent event from bubbling up to modal close handler
                    e.stopPropagation()
                  }}
                >
                  {Icon ? <Icon className={cn("mr-2 h-4 w-4", backgroundClassName?.includes('text-white') && 'text-white')} style={iconColor ? { color: iconColor } : undefined} /> : null}
                  <span>{label}</span>
                </button>
              </DropdownMenuTrigger>
              {!hideChevron && (
                <>
                  <span className={cn("h-9 w-px bg-muted/80", backgroundClassName?.includes('text-white') && 'bg-white/30')} />
                  <DropdownMenuTrigger asChild>
                    <button
                      onMouseDown={(e) => {
                        // Prevent event from bubbling up to modal close handler
                        e.stopPropagation()
                      }}
                      onClick={(e) => {
                        // Prevent event from bubbling up to modal close handler
                        e.stopPropagation()
                        // Call onChevronClick if provided (dropdown will open automatically via DropdownMenuTrigger)
                        if (onChevronClick) {
                          onChevronClick()
                        }
                      }}
                      className={cn("flex items-center justify-center px-2 py-[1px] focus:outline-none rounded-r-md hover:bg-muted/50 transition-colors h-[36px]", backgroundClassName)}
                    >
                      <IconComponent className={cn("h-4 w-4 text-foreground", backgroundClassName?.includes('text-white') && 'text-white')} />
                    </button>
                  </DropdownMenuTrigger>
                </>
              )}
            </>
          ) : (
            <DropdownMenuTrigger asChild>
              <button 
                className={cn("flex items-center focus:outline-none rounded-md h-[36px]", backgroundClassName)}
                style={{ cursor: 'pointer' }}
                onMouseDown={(e) => {
                  // Prevent event from bubbling up to modal close handler
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  // Prevent event from bubbling up to modal close handler
                  e.stopPropagation()
                }}
              >
                <div className="flex items-center px-4 py-[1px] text-base font-regular">
                  {Icon ? <Icon className={cn("mr-2 h-4 w-4", backgroundClassName?.includes('text-white') && 'text-white')} style={iconColor ? { color: iconColor } : undefined} /> : null}
                  <span>{label}</span>
                </div>
                {!hideChevron && (
                  <>
                    <span className={cn("h-9 w-px bg-muted/80", backgroundClassName?.includes('text-white') && 'bg-white/30')} />
                    <div className="flex items-center justify-center w-8">
                      <IconComponent className={cn("h-4 w-4 text-foreground", backgroundClassName?.includes('text-white') && 'text-white')} />
                    </div>
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
          )}
        </div>
        <DropdownMenuContent
          align={align}
          className="z-[2000] w-auto min-w-fit max-w-[20rem] max-h-[min(20rem,70vh)] overflow-y-auto border border-muted/70 bg-white text-foreground shadow-lg"
          onCloseAutoFocus={(e) => {
            // Prevent focus from being stolen when dropdown closes
            e.preventDefault()
          }}
          onInteractOutside={(e) => {
            // Prevent closing the modal when clicking outside dropdown content
            // Only prevent if clicking inside the task board
            const taskBoard = document.querySelector('[data-task-board]')
            const isInsideTaskBoard = taskBoard && taskBoard.contains(e.target)
            if (isInsideTaskBoard) {
              e.preventDefault()
            }
          }}
        >
        {title && (
          <>
            <DropdownMenuLabel className="px-2 text-sm font-semibold text-muted-foreground">
              {title}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {options.length ? (
          options.map((opt) => (
            <DropdownMenuItem
              key={opt.value || opt.label}
              className="gap-2 whitespace-nowrap"
              onSelect={(e) => {
                // Close dropdown immediately for all selections
                setOpen(false)
                
                // If upgrade tag is shown, trigger upgrade modal instead of the action
                if (opt.showUpgradeTag) {
                  e.preventDefault()
                  // Call the upgrade handler if provided
                  if (opt.onUpgradeClick && typeof opt.onUpgradeClick === 'function') {
                    opt.onUpgradeClick()
                  }
                  return
                }
                handleSelect(opt)
              }}
              disabled={opt.disabled && !opt.upgradeTag}
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {opt.icon ? <opt.icon className="h-4 w-4 shrink-0" /> : null}
                  {React.isValidElement(opt.label) ? (
                    opt.label
                  ) : (
                    <span className="truncate">{opt.label}</span>
                  )}
                </div>
                {opt.upgradeTag && (
                  <div 
                    onClick={(e) => {
                      // Stop propagation to prevent menu item's onSelect from firing
                      e.stopPropagation()
                      // Close the dropdown immediately so upgrade modal isn't covered
                      setOpen(false)
                    }}
                    onMouseDown={(e) => {
                      // Stop propagation to prevent dropdown from handling the event
                      e.stopPropagation()
                      // Close dropdown on mouseDown to ensure it closes before modal opens
                      setOpen(false)
                    }}
                    className="flex-shrink-0"
                  >
                    {opt.upgradeTag}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No options</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  )
}

export default DropdownCn
