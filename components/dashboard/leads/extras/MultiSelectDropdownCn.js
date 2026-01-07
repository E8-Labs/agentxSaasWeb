'use client'

import { Check, ChevronDown, Users } from 'lucide-react'
import { useMemo } from 'react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
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
          options.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.id || opt.value || opt.label}
              checked={!!opt.selected}
              className="gap-2 px-2 justify-start"
              onCheckedChange={(checked) => onToggle?.(opt, checked)}
            >
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
              <span className="flex-1 truncate">{opt.label}</span>
              {opt.selected ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No agents</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MultiSelectDropdownCn
