'use client'

import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * A pill-shaped split dropdown used across lead details (Send, Payment, Stage).
 * options: [{ label, icon, value, onSelect }]
 */
const DropdownCn = ({ label, icon: Icon, options = [], onSelect, align = 'start' }) => {
  const handleSelect = (opt) => {
    onSelect?.(opt)
    opt?.onSelect?.(opt)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-md border border-muted/0.9  bg-white px-4 py-[1px] text-base font-semibold shadow-sm focus:outline-none">
          {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
          <span>{label}</span>
          <span className="mx-3 h-9 w-px bg-muted/80" />
          <ChevronDown className="h-4 w-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="z-[2000] w-52 border border-muted/70 bg-white text-foreground shadow-lg"
      >
        {options.length ? (
          options.map((opt) => (
            <DropdownMenuItem
              key={opt.value || opt.label}
              className="gap-2"
              onClick={() => handleSelect(opt)}
            >
              {opt.icon ? <opt.icon className="h-4 w-4" /> : null}
              {opt.label}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No options</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownCn
