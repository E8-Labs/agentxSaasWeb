'use client'

import { ChevronDown, Users, Circle } from 'lucide-react'
import { useMemo } from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TypographyBody } from './TypographyCN'

/**
 * Pill-shaped multi-select dropdown for assigning team members.
 * options: [{ id, label, avatar, selected }]
 */
const MultiSelectDropdownCn = ({ label = 'Assign', options = [], onToggle }) => {
  const selectedCount = useMemo(
    () => options.filter((opt) => opt.selected).length,
    [options],
  )

  const handleOptionClick = (opt) => {
    const isCurrentlySelected = opt.selected
    onToggle?.(opt, !isCurrentlySelected)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-xl border border-muted/70 bg-white px-4 py-2 text-base font-regular shadow-sm focus:outline-none">
          <Users className="mr-2 h-4 w-4" />
          <TypographyBody>
          <span>{label}</span>
          </TypographyBody>
          {selectedCount ? (
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
              {selectedCount}
            </span>
          ) : null}
          <span className="mx-3 h-6 w-px bg-muted/80" />
          <ChevronDown className="h-4 w-4 text-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="z-[2000] w-64 border border-muted/70 bg-white text-foreground shadow-lg px-1 max-h-[300px] overflow-y-auto"
      >
        <DropdownMenuLabel className="px-2 text-sm font-semibold text-muted-foreground">
          Assign agents
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.length ? (
          options.map((opt) => {
            const isSelected = opt.selected

            return (
              <DropdownMenuItem
                key={opt.id || opt.value || opt.label}
                className="gap-2 px-2 justify-end pl-8 text-brand-primary hover:text-brand-primary cursor-pointer relative"
                onSelect={(e) => {
                  e.preventDefault()
                  handleOptionClick(opt)
                }}
              >
                {/* Radio button indicator */}
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Circle 
                    className={`h-3.5 w-3.5 stroke-current stroke-2 fill-none ${
                      isSelected ? 'text-brand-primary' : 'text-muted-foreground'
                    }`} 
                  />
                  {isSelected && (
                    <Circle className="absolute h-2 w-2 fill-current text-brand-primary" />
                  )}
                </span>
                
                <div className="flex items-center gap-2 flex-1">
                  {opt.avatar ? (
                    <img
                      src={opt.avatar}
                      alt={opt.label}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {opt.label?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <TypographyBody className="text-black">{opt.label}</TypographyBody>
                </div>
              </DropdownMenuItem>
            )
          })
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No agents</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MultiSelectDropdownCn
