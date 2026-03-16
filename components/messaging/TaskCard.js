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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Time picker helpers (value: "HH:mm" 24h) - same as TaskForm.js
function parseTime24(value) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return { hour12: 12, minute: 0, ampm: 'PM' }
  const [h, m] = value.split(':').map(Number)
  const hour24 = Math.min(23, Math.max(0, h))
  const minute = Math.min(59, Math.max(0, m))
  return { hour12: hour24 % 12 || 12, minute, ampm: hour24 >= 12 ? 'PM' : 'AM' }
}
function toTime24(hour12, minute, ampm) {
  let h = ampm === 'PM' && hour12 !== 12 ? hour12 + 12 : hour12
  if (ampm === 'AM' && hour12 === 12) h = 0
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}
function formatTime12(value) {
  if (!value) return ''
  const { hour12, minute, ampm } = parseTime24(value)
  return `${hour12}:${String(minute).padStart(2, '0')} ${ampm}`
}

function CustomTimePicker({ value, onChange, onCancel }) {
  const p = parseTime24(value || '12:00')
  const [hour12, setHour12] = useState(p.hour12)
  const [minute, setMinute] = useState(p.minute)
  const [ampm, setAmpm] = useState(p.ampm)
  useEffect(() => {
    const next = parseTime24(value || '12:00')
    setHour12(next.hour12)
    setMinute(next.minute)
    setAmpm(next.ampm)
  }, [value])
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i)
  const selectedClass = 'bg-brand-primary text-white'
  const unselectedClass = 'text-foreground hover:bg-black/[0.06]'
  const colClass = 'flex flex-col overflow-y-auto max-h-[200px] min-w-[52px] rounded-md border border-black/[0.08] bg-muted/30 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
  return (
    <div className="p-3">
      <div className="flex gap-2 mb-3">
        <div className={colClass}>
          {hours.map((h) => (
            <button key={h} type="button" onClick={() => setHour12(h)} className={cn('flex items-center justify-center py-2 text-sm font-medium cursor-pointer transition-colors', hour12 === h ? selectedClass : unselectedClass)} aria-pressed={hour12 === h}>{h}</button>
          ))}
        </div>
        <div className={colClass}>
          {minutes.map((m) => (
            <button key={m} type="button" onClick={() => setMinute(m)} className={cn('flex items-center justify-center py-2 text-sm font-medium cursor-pointer transition-colors', minute === m ? selectedClass : unselectedClass)} aria-pressed={minute === m}>{String(m).padStart(2, '0')}</button>
          ))}
        </div>
        <div className={colClass}>
          {['AM', 'PM'].map((a) => (
            <button key={a} type="button" onClick={() => setAmpm(a)} className={cn('flex items-center justify-center py-2 text-sm font-medium cursor-pointer transition-colors', ampm === a ? selectedClass : unselectedClass)} aria-pressed={ampm === a}>{a}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button type="button" size="sm" className="bg-brand-primary text-white hover:bg-brand-primary/90" onClick={() => { onChange(toTime24(hour12, minute, ampm)); }}>OK</Button>
      </div>
    </div>
  )
}

const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  onEditClick,
  onPin,
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
    {
        label: 'Edit',
        value: 'edit',
        onSelect: () => {
            onEditClick(task.id)

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
  const [timePickerOpen, setTimePickerOpen] = useState(false)
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
    <div
      className="border bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
    >
      {/* Title with Pin and Priority - title truncates, dropdowns always visible on the right */}
      <div className="flex items-center gap-2 w-full min-w-0">
        {/* Left: pin + title + AI badge (title truncates) */}
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {onPin ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPin(task.id, !task.isPinned)
              }}
              className="flex-shrink-0 p-0.5 rounded hover:bg-muted/50 transition-colors"
              aria-label={task.isPinned ? 'Unpin task' : 'Pin task'}
            >
              <Pin
                className={cn(
                  'h-4 w-4 transition-colors',
                  task.isPinned ? 'fill-brand-primary text-brand-primary' : 'text-[#8A8A8A]',
                )}
              />
            </button>
          ) : (
            <Pin className="h-4 w-4 flex-shrink-0" style={{ color: '#8A8A8A' }} />
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold text-foreground"
                  style={{ minWidth: 0 }}
                >
                  {task.title}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px] bg-gray-900 text-white">
                {task.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* AI Badge - only when task is still in AI status (not when moved to todo/in-progress/done) */}
          {task.type === 'ai_summary' && task.status === 'ai' && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-100 text-purple-700 border border-purple-200">
              AI
            </span>
          )}
        </div>
        {/* Right: Priority + More options (always visible, never shrink) */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            <DropdownCn
              label={<TypographyCaption>{currentPriority.label}</TypographyCaption>}
              icon={PriorityFlagIcon}
              options={priorityOptions.map((opt) => ({
                label: renderPriorityOptionLabel(opt),
                value: opt.value,
              }))}
              onSelect={handlePriorityChange}
              backgroundClassName="text-foreground"
              className="border-0 shadow-none h-[36px] min-w-0"
            />
          {/* More Options - No border, no chevron */}
          <DropdownCn
            label=""
            icon={MoreVertical}
            options={moreOptions}
            backgroundClassName="text-foreground"
            className="border-0 shadow-none h-[36px] w-[28px] min-w-[28px]"
            hideChevron={true}
            iconColor="#8A8A8A"
          />
        </div>
      </div>

      {/* Description - constrained to card width, preserve line breaks, wrap long lines */}
      {task.description && (
        <div className="mb-3 mt-2 w-full min-w-0 overflow-hidden">
          <TypographyBody
            className="text-muted-foreground line-height-2 break-words"
            style={{ overflowWrap: 'break-word', whiteSpace: 'pre-line' }}
          >
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

      {/* Action Row - Assignees, Due Date, Status (consistent spacing, constrained width) */}
      <div className="flex items-center flex-wrap gap-3 mt-3 w-full min-w-0 overflow-hidden">
        {/* Assignees - Use MultiSelectDropdownCn with visible borders */}
        <div className="flex-shrink-0">
          <MultiSelectDropdownCn
            label="Assign"
            options={teamMemberOptions}
            onToggle={handleAssigneeToggle}
          />
        </div>

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
              className="flex items-center gap-1 px-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 h-[36px] flex-shrink-0"
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

              {/* Time picker (same as TaskForm: scrollable hour/minute/AM-PM, Cancel/OK, optional due time) */}
              {dueDate && (
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Popover open={timePickerOpen} onOpenChange={setTimePickerOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex h-[40px] w-full items-center rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-left text-[14px]',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:border-brand-primary cursor-pointer hover:border-black/10'
                        )}
                      >
                        {dueTime ? formatTime12(dueTime) : 'Due time (optional)'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                      style={{ zIndex: 1500 }}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <CustomTimePicker
                        value={dueTime}
                        onChange={(next) => { setDueTime(next); setTimePickerOpen(false); }}
                        onCancel={() => setTimePickerOpen(false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status */}
        <div className="flex-shrink-0">
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
