'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/**
 * A pill-shaped split dropdown used across lead details (Send, Payment, Stage).
 * options: [{ label, icon, value, onSelect }]
 * chevronIcon: Optional custom icon component to replace the default ChevronDown
 * onChevronClick: Optional handler for when the chevron/icon is clicked (for split button behavior)
 */
const DropdownCn = ({ label, icon: Icon, options = [], onSelect, align = 'start', backgroundClassName, chevronIcon: ChevronIcon, onChevronClick }) => {
  const [open, setOpen] = useState(false)
  const scrollContainerRef = useRef(null)

  const handleSelect = (opt) => {
    onSelect?.(opt)
    opt?.onSelect?.(opt)
    setOpen(false)
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
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <div className="flex items-center rounded-md border border-muted/0.9 bg-white shadow-sm">
          {onChevronClick ? (
            <>
              <button 
                className={cn("flex items-center px-4 py-[1px] text-base font-regular focus:outline-none rounded-l-md", backgroundClassName)}
                onClick={() => {
                  // If there's a chevron click handler, the main button doesn't open dropdown
                  // This allows split button behavior
                }}
              >
                {Icon ? <Icon className={cn("mr-2 h-4 w-4", backgroundClassName?.includes('text-white') && 'text-white')} /> : null}
                <span>{label}</span>
              </button>
              <span className={cn("h-9 w-px bg-muted/80", backgroundClassName?.includes('text-white') && 'bg-white/30')} />
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    // #region agent log
                    fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DropdownCn.js:63',message:'Chevron button clicked',data:{hasOnChevronClick:!!onChevronClick},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
                    // #endregion
                    e.stopPropagation()
                    // Don't call onChevronClick here - let the dropdown open
                  }}
                  className={cn("flex items-center justify-center px-2 py-[1px] focus:outline-none rounded-r-md hover:bg-muted/50 transition-colors", backgroundClassName)}
                >
                  <IconComponent className={cn("h-4 w-4 text-foreground", backgroundClassName?.includes('text-white') && 'text-white')} />
                </button>
              </DropdownMenuTrigger>
            </>
          ) : (
            <DropdownMenuTrigger asChild>
              <button className={cn("flex items-center focus:outline-none rounded-md", backgroundClassName)}>
                <div className="flex items-center px-4 py-[1px] text-base font-regular">
                  {Icon ? <Icon className={cn("mr-2 h-4 w-4", backgroundClassName?.includes('text-white') && 'text-white')} /> : null}
                  <span>{label}</span>
                </div>
                <span className={cn("h-9 w-px bg-muted/80", backgroundClassName?.includes('text-white') && 'bg-white/30')} />
                <div className="flex items-center justify-center w-8">
                  <IconComponent className={cn("h-4 w-4 text-foreground", backgroundClassName?.includes('text-white') && 'text-white')} />
                </div>
              </button>
            </DropdownMenuTrigger>
          )}
        </div>
        <DropdownMenuContent
          align={align}
          className="z-[2000] w-auto min-w-fit max-w-[20rem] border border-muted/70 bg-white text-foreground shadow-lg"
        >
        {options.length ? (
          options.map((opt) => (
            <DropdownMenuItem
              key={opt.value || opt.label}
              className="gap-2 whitespace-nowrap"
              onSelect={() => handleSelect(opt)}
            >
              {opt.icon ? <opt.icon className="h-4 w-4 shrink-0" /> : null}
              <span className="truncate">{opt.label}</span>
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
