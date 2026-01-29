'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CalendarIcon, Clock, MoreVertical, Pin, ChevronDown } from 'lucide-react'
import moment from 'moment'
import DropdownCn from '@/components/dashboard/leads/extras/DropdownCn'
import MultiSelectDropdownCn from '@/components/dashboard/leads/extras/MultiSelectDropdownCn'
import { TypographyBody, TypographyBodySemibold, TypographyCaption } from '@/lib/typography'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  teamMembers = [],
  priorityOptions = [],
  statusOptions = [],
}) => {
  // Get current priority option (used for label + color)
  const currentPriority =
    priorityOptions.find((p) => p.value === task.priority) || priorityOptions[0]

  const getPriorityKey = (priorityValue, priorityLabel) => {
    const raw = (priorityValue ?? priorityLabel ?? '').toString().trim().toLowerCase()
    if (raw === 'low' || raw === 'l' || raw === '1') return 'low'
    if (raw === 'medium' || raw === 'med' || raw === 'm' || raw === '2') return 'medium'
    if (raw === 'high' || raw === 'h' || raw === '3') return 'high'
    return 'low'
  }

  const priorityFlagColors = {
    low: '#4B5563', // dark gray fill
    medium: '#FBBF24', // yellow fill
    high: '#EF4444', // red fill
  }

  const PriorityFlagMask = ({ priorityKey, className }) => {
    const color = priorityFlagColors[priorityKey] || priorityFlagColors.low
    return (
      <div
        className={className}
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url(/svgIcons/flagFilled.svg)`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskMode: 'alpha',
          maskImage: `url(/svgIcons/flagFilled.svg)`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskMode: 'alpha',
          flexShrink: 0,
        }}
        aria-hidden="true"
      />
    )
  }

  const PriorityFlagIcon = ({ className }) => {
    const priorityKey = getPriorityKey(currentPriority?.value, currentPriority?.label)
    return <PriorityFlagMask priorityKey={priorityKey} className={className} />
  }

  const renderPriorityOptionLabel = (opt) => {
    const priorityKey = getPriorityKey(opt?.value, opt?.label)
    const labelText = typeof opt?.label === 'string' ? opt.label : String(opt?.value ?? '')
    return (
      <div className="flex items-center gap-2">
        <PriorityFlagMask priorityKey={priorityKey} className="h-4 w-4" />
        <span>{labelText}</span>
      </div>
    )
  }

  // Format due date
  const formatDueDate = () => {
    if (!task.dueDate) return null
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    let dateStr = format(dueDate, 'MM/dd/yy')
    // Add time if available
    if (task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':')
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      dateStr = `${dateStr} ${displayHour}:${minutes} ${ampm}`
    }

    if (dueDate < now && task.status !== 'done') {
      return { text: `Past Due: ${dateStr}`, isPastDue: true }
    }
    return { text: `${dateStr}`, isPastDue: false }
  }

  const dueDateInfo = formatDueDate()

  // Get assigned members for display
  const assignedMembers = task.assignedMembers || []
  const assignedMemberIds = assignedMembers.map((m) => m.id)

  // Prepare team member options for multi-select
  const teamMemberOptions = teamMembers.map((member) => {
    const id = member.invitedUserId || member.invitedUser?.id || member.id
    return {
      id,
      label: member.name || member.invitedUser?.name || 'Unknown',
      avatar: member.thumb_profile_image || member.invitedUser?.thumb_profile_image,
      selected: assignedMemberIds.includes(id),
      raw: member,
    }
  })

  // Handle priority change
  const handlePriorityChange = (option) => {
    onUpdate(task.id, { priority: option.value })
  }

  // Handle status change
  const handleStatusChange = (option) => {
    onUpdate(task.id, { status: option.value })
  }

  // Handle assignee toggle
  const handleAssigneeToggle = (member, shouldAssign) => {
    const memberId = member.id
    const currentAssignments = assignedMemberIds
    let newAssignments

    if (shouldAssign) {
      newAssignments = [...currentAssignments, memberId]
    } else {
      newAssignments = currentAssignments.filter((id) => id !== memberId)
    }

    onUpdate(task.id, { assignedTo: newAssignments })
  }

  // More options menu
  const moreOptions = [
    {
      label: 'Delete',
      value: 'delete',
      onSelect: () => {
       
          onDelete(task.id)
        
      },
    },
  ]

  // Status color mapping (hex colors)
  const statusColors = {
    todo: '#7804DF',
    'in-progress': '#FF8102',
    done: '#01CB76',
  }

  // Status display text mapping
  const statusDisplayText = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  }

  // Get creator info
  const creator = task.creator || task.createdByUser
  const creatorName = creator?.name || 'Unknown'
  const creatorAvatar = creator?.thumb_profile_image

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate) : null)
  const [dueTime, setDueTime] = useState(task.dueTime || '')
  const [isSavingDate, setIsSavingDate] = useState(false)
  const savingRef = useRef(false) // Prevent duplicate saves

  // Sync state with task prop changes
  useEffect(() => {
    setDueDate(task.dueDate ? new Date(task.dueDate) : null)
    setDueTime(task.dueTime || '')
  }, [task.dueDate, task.dueTime])

  // Handle due date change
  const handleDueDateChange = async () => {
    // Prevent duplicate calls
    if (savingRef.current) return
    savingRef.current = true
    setIsSavingDate(true)
    try {
      await onUpdate(task.id, {
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        dueTime: dueTime || null,
      })
    } finally {
      setIsSavingDate(false)
      setDatePickerOpen(false)
      savingRef.current = false
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Title with Pin and Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Pin className="h-4 w-4 flex-shrink-0" style={{ color: '#8A8A8A' }} />
          <TypographyBodySemibold className="text-foreground">
            {task.title}
          </TypographyBodySemibold>
          {/* AI Badge for tasks created from call summaries */}
          {task.type === 'ai_summary' && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-100 text-purple-700 border border-purple-200">
              AI
            </span>
          )}
        </div>
        {/* Priority and More Options - Top Right */}
        <div className="ml-2 flex items-center gap-2">
            <DropdownCn
              label={<TypographyCaption>{currentPriority.label}</TypographyCaption>}
              icon={PriorityFlagIcon}
              options={priorityOptions.map((opt) => ({
                label: renderPriorityOptionLabel(opt),
                value: opt.value,
              }))}
              onSelect={handlePriorityChange}
              backgroundClassName="text-foreground"
              className="border-0 shadow-none h-[36px]"
            />
          {/* More Options - No border, no chevron */}
          <DropdownCn
            label=""
            icon={MoreVertical}
            options={moreOptions}
            backgroundClassName="text-foreground"
            className="border-0 shadow-none h-[36px] w-[30px]"
            hideChevron={true}
            iconColor="#8A8A8A"
          />
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <div style={{ maxWidth: '200px' }} className="mb-3 mt-2 ">
          <TypographyBody className="text-muted-foreground line-height-2">
            {task.description}
          </TypographyBody>
        </div>
      )}

      {/* Created Info with Avatar */}
      {/* <div className="flex items-center gap-2 mb-3">
        <TypographyCaption className="text-muted-foreground">
          Created on {moment(task.createdAt).format('MMM DD')} By:{' '}
        </TypographyCaption>
        <div className="flex items-center gap-1">
          {creatorAvatar ? (
            <img
              src={creatorAvatar}
              alt={creatorName}
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
              {creatorName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <TypographyCaption className="text-foreground font-semibold">
            {creatorName}
          </TypographyCaption>
        </div>
      </div> */}

      {/* Action Row - Assignees, Due Date, Status (bottom right) */}
      <div className="flex items-center gap-2 justify-between mt-3">
        {/* Assignees - Use MultiSelectDropdownCn with visible borders */}
        <MultiSelectDropdownCn
          label="Assign"
          options={teamMemberOptions}
          onToggle={handleAssigneeToggle}
        />

        {/* Due Date - Editable Popover */}
        <Popover open={datePickerOpen} onOpenChange={(open) => {
          // Only handle closing if not already saving
          if (!open && !isSavingDate && !savingRef.current) {
            // Check if date/time changed
            const taskDueDate = task.dueDate ? new Date(task.dueDate) : null
            const taskDueTime = task.dueTime || ''
            const hasChanges = dueDate?.getTime() !== taskDueDate?.getTime() || dueTime !== taskDueTime
            
            if (hasChanges) {
              // Only save if there are actual changes
              handleDueDateChange()
            } else {
              // No changes, just close
              setDatePickerOpen(false)
            }
          }
        }}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 h-[36px]"
              style={{ cursor: 'pointer' }}
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
                if (!datePickerOpen) {
                  setDatePickerOpen(true)
                }
              }}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground pointer-events-none" />
              {isSavingDate ? (
                <TypographyBody className="text-muted-foreground pointer-events-none">
                  Saving...
                </TypographyBody>
              ) : (
                <TypographyCaption
                  className={cn(
                    'pointer-events-none whitespace-nowrap',
                    dueDateInfo?.isPastDue ? 'text-red-500 font-normal text-[12px]' : 'text-muted-foreground text-sm',
                  )}
                >
                  {dueDateInfo ? dueDateInfo.text : 'Due Date'}
                </TypographyCaption>
              )}
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-1 pointer-events-none" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start"
            style={{ zIndex: 1500 }}
            onInteractOutside={(e) => {
              // Prevent handling if already saving
              if (savingRef.current || isSavingDate) {
                e.preventDefault()
                return
              }

              // Check if clicking on the popover content itself
              const popoverContent = e.target.closest('[role="dialog"]')
              if (popoverContent) {
                // Clicking inside popover - prevent closing
                e.preventDefault()
                return
              }

              // Clicking outside popover - let onOpenChange handle the save
              // We don't need to save here since onOpenChange will be called
              // Just prevent default to allow normal popover closing behavior
            }}
          >
            <div className="p-3 space-y-3">
              {/* Quick select buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    setDueDate(today)
                  }}
                >
                  Today
                </Button>
                <Button
                  type="button"
                  variant={
                    dueDate && format(dueDate, 'yyyy-MM-dd') === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd')
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => {
                    const tomorrow = new Date()
                    tomorrow.setDate(tomorrow.getDate() + 1)
                    tomorrow.setHours(0, 0, 0, 0)
                    setDueDate(tomorrow)
                  }}
                >
                  Tomorrow
                </Button>
                <Button
                  type="button"
                  variant={dueDate ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => setDueDate(null)}
                >
                  Custom
                </Button>
              </div>

              {/* Calendar */}
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />

              {/* Time input */}
              {dueDate && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    onClick={(e) => {
                      // Ensure the time picker opens when clicking anywhere on the input
                      e.currentTarget.showPicker?.()
                    }}
                    className="w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                    style={{
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield',
                    }}
                    placeholder="Due time (optional)"
                  />
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status - Bottom Right */}
        <div className="">
          <DropdownCn
            label={
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: statusColors[task.status] || '#9CA3AF' }}
                />
                <TypographyCaption className = {'whitespace-nowrap'}>{statusDisplayText[task.status] || task.status}</TypographyCaption>
              </div>
            }
            options={statusOptions.map((opt) => ({
              label: (
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: statusColors[opt.value] || '#9CA3AF' }}
                  />
                  <span>{typeof opt.label === 'string' ? opt.label : opt.value}</span>
                </div>
              ),
              value: opt.value,
            }))}
            onSelect={handleStatusChange}
            backgroundClassName="text-foreground"
            className="h-[36px]"
          />
        </div>
      </div>
    </div>
  )
}

export default TaskCard
