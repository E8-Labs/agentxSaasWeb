'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TypographyCaption } from '@/lib/typography'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  const hasActiveFilters = filterMember != null || filterDueStatus != null || filterPriority != null;
  //filter by types
  const Filter_By_Types = [
    { id: 1, label: 'Members', value: 'members' },
    { id: 2, label: 'Status', value: 'status' },
    { id: 3, label: 'Priority', value: 'priority' },
  ]

  const [filterType, setFilterType] = useState('members');

  const handleChangeFilterType = (value) => {
    setFilterType(value);
  };

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
      >
        <div
          className="px-3"
          style={{ paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid #eaeaea' }}
        >
          <TypographyCaption className="font-semibold text-foreground block mb-2">
            Filter by
          </TypographyCaption>
          <Tabs value={filterType} onValueChange={handleChangeFilterType}>
            <TabsList className="flex w-full shrink-0 h-9 items-center justify-between rounded-lg bg-muted p-1 text-muted-foreground text-[14px] font-['Inter'] gap-2 [&_svg]:size-4">
              {Filter_By_Types.map((type) => (
                <TabsTrigger
                  key={type.id}
                  value={type.value}
                  className="flex-1 min-w-0 text-[14px] gap-1 active:scale-[0.98] transition-transform duration-150"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="p-3 space-y-4 max-h-[320px] overflow-y-auto">
          {/* Members */}
          <div className="space-y-2">
            {
              filterType === 'members' ? (
                <RadioGroup
                  value={filterMember != null ? String(filterMember) : 'all'}
                  onValueChange={(v) =>
                    setFilterMember(v === 'all' ? null : parseInt(v, 10))
                  }
                  className="space-y-1.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="all" id="members-all" />
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[14px] text-foreground">All Members</span>
                  </label>
                  {teamMembers.map((m) => {
                    const id = m.invitedUserId ?? m.invitedUser?.id ?? m.id
                    const name = m.name ?? m.invitedUser?.name ?? 'Unknown'
                    const img =
                      m.thumb_profile_image ?? m.invitedUser?.thumb_profile_image
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-2 cursor-pointer rounded px-2 py-1.5 hover:bg-black/[0.04]"
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
                        <span className="text-[14px] text-foreground truncate">{name}</span>
                      </label>
                    )
                  })}
                </RadioGroup>
              ) : filterType === 'status' ? (
                <RadioGroup
                  value={filterDueStatus ?? 'all'}
                  onValueChange={(v) =>
                    setFilterDueStatus(v === 'all' ? null : v)
                  }
                  className="space-y-1.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="all" id="status-all" />
                    <span className="text-[14px] text-foreground">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="past-due" id="status-past-due" />
                    <span className="text-[14px] text-foreground">Past Due</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="due-today" id="status-due-today" />
                    <span className="text-[14px] text-foreground">Due Today</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="in-future" id="status-in-future" />
                    <span className="text-[14px] text-foreground">In future</span>
                  </label>
                </RadioGroup>
              ) : filterType === 'priority' ? (
                <RadioGroup
                  value={filterPriority ?? 'all'}
                  onValueChange={(v) =>
                    setFilterPriority(v === 'all' ? null : v)
                  }
                  className="space-y-1.5"
                >
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="all" id="priority-all" />
                    <span className="text-[14px] text-foreground">All</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="no-priority" id="priority-no-priority" />
                    <span className="text-[14px] text-foreground">No Priority</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="low" id="priority-low" />
                    <span className="text-[14px] text-foreground">Low</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="medium" id="priority-medium" />
                    <span className="text-[14px] text-foreground">Medium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 transition-colors hover:bg-black/[0.04]">
                    <RadioGroupItem value="high" id="priority-high" />
                    <span className="text-[14px] text-foreground">High</span>
                  </label>
                </RadioGroup>
              ) : null
            }

          </div>
          {/* Status (due date) */}
          {/* Priority */}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TaskBoardFilterPopover
