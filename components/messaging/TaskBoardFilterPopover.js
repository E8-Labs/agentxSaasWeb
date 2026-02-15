'use client'

import React from 'react'
import Image from 'next/image'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TypographyCaption } from '@/lib/typography'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

/**
 * Filter popover for Task Board: Members, Status (due date), Priority.
 * Shows a dot on the trigger when any filter is applied.
 */
const TaskBoardFilterPopover = ({
  filterMember,
  setFilterMember,
  filterDueStatus,
  setFilterDueStatus,
  filterPriority,
  setFilterPriority,
  teamMembers = [],
}) => {
  const hasActiveFilters =
    filterMember != null || filterDueStatus != null || filterPriority != null

  return (
    <Popover style={{ zIndex: 1555 }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src="/svgIcons/filter%20task.svg"
            alt="Filter"
            width={16}
            height={16}
          />
          {hasActiveFilters && (
            <div
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ backgroundColor: 'hsl(var(--brand-primary))' }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        className="w-72 p-0"
        style={{ zIndex: 1600 }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        // onInteractOutside={(e) => e.preventDefault()}
        // onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          const taskBoard = document.querySelector('[data-task-board]')
          const target = e.detail?.originalEvent?.target ?? e.target
          if (taskBoard?.contains(target)) return // click inside task board → allow close
          e.preventDefault() // click outside task board (e.g. modal) → keep open
        }}
        onPointerDownOutside={(e) => {
          const taskBoard = document.querySelector('[data-task-board]')
          const target = e.detail?.originalEvent?.target ?? e.target
          if (taskBoard?.contains(target)) return
          e.preventDefault()
        }}
      >
        <div className="p-3 border-none border-gray-200">
          <TypographyCaption className="font-semibold text-[#666666]">
            Filter by
          </TypographyCaption>
        </div>
        <div className="p-3 space-y-4 max-h-[320px] overflow-y-auto">
          {/* Members */}
          <div className="space-y-2">
            <TypographyCaption className="text-muted-foreground font-medium">
              Members
            </TypographyCaption>
            <RadioGroup
              value={filterMember != null ? String(filterMember) : 'all'}
              onValueChange={(v) =>
                setFilterMember(v === 'all' ? null : parseInt(v, 10))
              }
              className="space-y-1.5"
            >
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="all" id="members-all" />
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">All Members</span>
              </label>
              {teamMembers.map((m) => {
                const id = m.invitedUserId ?? m.invitedUser?.id ?? m.id
                const name = m.name ?? m.invitedUser?.name ?? 'Unknown'
                const img =
                  m.thumb_profile_image ?? m.invitedUser?.thumb_profile_image
                return (
                  <label
                    key={id}
                    className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50"
                  >
                    <RadioGroupItem value={String(id)} id={`member-${id}`} />
                    <Avatar className="h-5 w-5">
                      {img ? (
                        <AvatarImage src={img} alt={name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {name[0]?.toUpperCase() ?? '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{name}</span>
                  </label>
                )
              })}
            </RadioGroup>
          </div>
          {/* Status (due date) */}
          <div className="space-y-2">
            <TypographyCaption className="text-muted-foreground font-medium">
              Status
            </TypographyCaption>
            <RadioGroup
              value={filterDueStatus ?? 'all'}
              onValueChange={(v) =>
                setFilterDueStatus(v === 'all' ? null : v)
              }
              className="space-y-1.5"
            >
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="all" id="status-all" />
                <span className="text-sm">All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="past-due" id="status-past-due" />
                <span className="text-sm">Past Due</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="due-today" id="status-due-today" />
                <span className="text-sm">Due Today</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="in-future" id="status-in-future" />
                <span className="text-sm">In future</span>
              </label>
            </RadioGroup>
          </div>
          {/* Priority */}
          <div className="space-y-2">
            <TypographyCaption className="text-muted-foreground font-medium">
              Priority
            </TypographyCaption>
            <RadioGroup
              value={filterPriority ?? 'all'}
              onValueChange={(v) =>
                setFilterPriority(v === 'all' ? null : v)
              }
              className="space-y-1.5"
            >
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="all" id="priority-all" />
                <span className="text-sm">All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="no-priority" id="priority-no-priority" />
                <span className="text-sm">No Priority</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="low" id="priority-low" />
                <span className="text-sm">Low</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="medium" id="priority-medium" />
                <span className="text-sm">Medium</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-muted/50">
                <RadioGroupItem value="high" id="priority-high" />
                <span className="text-sm">High</span>
              </label>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TaskBoardFilterPopover
