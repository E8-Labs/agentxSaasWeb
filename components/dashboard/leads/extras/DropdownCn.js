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
 */
const DropdownCn = ({ label, icon: Icon, options = [], onSelect, align = 'start', backgroundClassName }) => {
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

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className={cn("flex items-center rounded-md border border-muted/0.9 bg-white px-4 py-[1px] text-base font-regular shadow-sm focus:outline-none", backgroundClassName)}>
            {Icon ? <Icon className={cn("mr-2 h-4 w-4", backgroundClassName?.includes('text-white') && 'text-white')} /> : null}
            <span>{label}</span>
            <span className={cn("mx-3 h-9 w-px bg-muted/80", backgroundClassName?.includes('text-white') && 'bg-white/30')} />
            <ChevronDown className={cn("h-4 w-4 text-foreground", backgroundClassName?.includes('text-white') && 'text-white')} />
          </button>
        </DropdownMenuTrigger>
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
