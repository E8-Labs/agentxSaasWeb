'use client'

import React, { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Pin, ChevronDown, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import DropdownCn from '@/components/dashboard/leads/extras/DropdownCn'
import MultiSelectDropdownCn from '@/components/dashboard/leads/extras/MultiSelectDropdownCn'
import { TypographyBody, TypographyBodySemibold, TypographyCaption, TypographyBodyMedium } from '@/lib/typography'

// Time picker helpers (value: "HH:mm" 24h)
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

const TaskForm = ({
  task = null,
  teamMembers = [],
  onSubmit,
  onCancel,
  leadId = null,
  threadId = null,
  callId = null,
  showButtons = true,
  shouldShowLeadMention = false,
  leadName = null,
  initialDescription = null,
  hideBorder = false,
  isValidForm = false,
  setIsValidForm = () => { },
  elevatedZIndex = false,
  defaultAssignees = null,
  requireDescription = true,
}) => {
  const titleInputRef = useRef(null)
  const titleContainerRef = useRef(null)
  const measureSpanRef = useRef(null)
  const [inputTextWidth, setInputTextWidth] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)

  // Initialize title - start empty, lead mention will be shown separately
  const getInitialTitle = () => {
    if (task?.title) return task.title
    return ''
  }

  const [title, setTitle] = useState(getInitialTitle())

  // Measure container width for overlap calculation
  useEffect(() => {
    const updateContainerWidth = () => {
      if (titleContainerRef.current) {
        setContainerWidth(titleContainerRef.current.offsetWidth)
      }
    }

    updateContainerWidth()
    window.addEventListener('resize', updateContainerWidth)

    // Use ResizeObserver if available for more accurate tracking
    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined' && titleContainerRef.current) {
      resizeObserver = new ResizeObserver(updateContainerWidth)
      resizeObserver.observe(titleContainerRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateContainerWidth)
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [])

  // Measure input text width to position the lead mention
  useEffect(() => {
    if (titleInputRef.current && measureSpanRef.current) {
      // Use a hidden span to measure the actual text width
      measureSpanRef.current.textContent = title || ' '
      const textWidth = measureSpanRef.current.offsetWidth
      setInputTextWidth(textWidth)
    }
  }, [title])

  const [description, setDescription] = useState(task?.description || initialDescription || '')
  const [priority, setPriority] = useState(task?.priority || 'no-priority')
  const [status, setStatus] = useState(task?.status || 'todo')
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate) : null)
  const [dueTime, setDueTime] = useState(task?.dueTime || '')
  const [selectedAssignees, setSelectedAssignees] = useState(
    task?.assignedMembers?.map((m) => m.id) || defaultAssignees || [],
  )
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [timePickerOpen, setTimePickerOpen] = useState(false)
  const [isSavingDate, setIsSavingDate] = useState(false)

  // Handle initial description from props
  useEffect(() => {
    if (initialDescription && !task?.description && !description) {
      setDescription(initialDescription)
    }
  }, [initialDescription, task?.description, description])

  // Sync form validity to parent (e.g. for CreateTaskFromNextStepsModal submit button)
  useEffect(() => {
    const valid = requireDescription
      ? !!(title?.trim() && description?.trim())
      : !!title?.trim()
    setIsValidForm(valid)
  }, [title, description, requireDescription, setIsValidForm])

  // Priority options
  const priorityOptions = [
    { label: 'No Priority', value: 'no-priority' },
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ]

  // Status options
  const statusOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
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

  // Get current priority option
  const currentPriority = priorityOptions.find((p) => p.value === priority) || priorityOptions[0]

  const getPriorityKey = (priorityValue, priorityLabel) => {
    const raw = (priorityValue ?? priorityLabel ?? '').toString().trim().toLowerCase()
    if (raw === 'low' || raw === 'l' || raw === '1') return 'low'
    if (raw === 'medium' || raw === 'med' || raw === 'm' || raw === '2')
      return 'medium'
    if (raw === 'high' || raw === 'h' || raw === '3') return 'high'
    if (raw === 'no-priority' || raw === 'none' || raw === 'no priority') return 'no-priority'
    return 'no-priority'
  }

  const priorityFlagColors = {
    'no-priority': '#9CA3AF', // neutral gray
    low: '#4B5563', // dark gray fill
    medium: '#FBBF24', // yellow fill
    high: '#EF4444', // red fill
  }

  const PriorityFlagMask = ({ priorityKey, className }) => {
    const color = priorityFlagColors[priorityKey] || priorityFlagColors['no-priority']
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

  // Prepare team member options
  const teamMemberOptions = teamMembers.map((member) => {
    const id = member.invitedUserId || member.invitedUser?.id || member.id
    return {
      id,
      label: member.name || member.invitedUser?.name || 'Unknown',
      avatar: member.thumb_profile_image || member.invitedUser?.thumb_profile_image,
      selected: selectedAssignees.includes(id),
      raw: member,
    }
  })

  // Handle assignee toggle
  const handleAssigneeToggle = (member, shouldAssign) => {
    const memberId = member.id
    if (shouldAssign) {
      setSelectedAssignees([...selectedAssignees, memberId])
    } else {
      setSelectedAssignees(selectedAssignees.filter((id) => id !== memberId))
    }
  }

  // Get first assigned member for display
  const firstAssignee = selectedAssignees.length > 0
    ? teamMembers.find((m) => (m.invitedUserId || m.invitedUser?.id || m.id) === selectedAssignees[0])
    : null

  // Format due date for display
  const formatDueDateDisplay = () => {
    if (!dueDate) return null
    const dateStr = format(dueDate, 'MM/dd/yy')
    if (dueTime) {
      // Format time from HH:mm to h:mm AM/PM
      const [hours, minutes] = dueTime.split(':')
      const hour = parseInt(hours, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${dateStr} ${displayHour}:${minutes} ${ampm}`
    }
    return dateStr
  }

  const dueDateDisplay = formatDueDateDisplay()

  // More options menu
  const moreOptions = [
    {
      label: 'Delete',
      value: 'delete',
      onSelect: () => {
        if (window.confirm('Are you sure you want to delete this task?')) {
          // Handle delete if needed
        }
      },
    },
  ]

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Title is required')
      return
    }

    const formData = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      dueTime: dueTime || null,
      assignedTo: selectedAssignees,
      leadId,
      threadId,
      callId,
    }

    onSubmit(formData)
  }

  // Calculate position for lead mention to avoid overlap with priority dropdown
  // Reserve approximately 180px from right for priority dropdown + more options + padding
  const priorityDropdownSpace = 180
  const leadMentionApproxWidth = leadName ? leadName.length * 8 + 25 : 0 // Approximate width of "@leadName"
  const availableSpace = Math.max(0, containerWidth - priorityDropdownSpace)

  // When focused, position mention after input text with spacing
  // When not focused, position mention after "Task for" text (approximately 80px from input start)
  const mentionSpacing = 8 // Gap between input text and mention
  const taskForTextWidth = 40 // Approximate width of "Task for " text

  // Calculate the maximum position where mention can be placed (before priority dropdown)
  const maxMentionPosition = Math.max(0, availableSpace - leadMentionApproxWidth)

  // Desired positions for mention
  const desiredPositionWhenFocused = inputTextWidth + mentionSpacing
  const desiredPositionWhenNotFocused = taskForTextWidth + mentionSpacing

  // Calculate where mention should be positioned (never exceed maxMentionPosition)
  const leadMentionLeft = isFocused
    ? Math.min(desiredPositionWhenFocused, maxMentionPosition)
    : Math.min(desiredPositionWhenNotFocused, maxMentionPosition)

  const maxWidthForMention = Math.max(100, availableSpace - leadMentionLeft)

  // Calculate max width for input to prevent covering the lead mention
  // Always constrain if we have a valid lead mention to ensure input never overlaps
  const shouldConstrainInput = shouldShowLeadMention && leadName && containerWidth > 0
  // Constrain input to ensure there's always room for the mention with padding
  // Input should never exceed the maximum mention position minus spacing
  const inputMaxWidth = shouldConstrainInput
    ? Math.max(100, maxMentionPosition - mentionSpacing - 4) // Leave gap for mention spacing plus small buffer
    : undefined

  return (
    <div className={`${hideBorder ? '' : 'border'} rounded-lg ${hideBorder ? 'p-0' : 'p-4'} bg-white ${hideBorder ? '' : 'shadow-sm'}`}>
      <form onSubmit={handleSubmit} className={cn(hideBorder ? 'pt-0' : '', 'text-[14px]')} id="task-form">
        {/* Title with Pin and Priority */}
        <div className="flex items-center justify-between">
          <div
            ref={titleContainerRef}
            className="flex items-center gap-2 flex-1 relative min-w-0"
          >
            <Pin className="h-4 w-4 flex-shrink-0" style={{ color: '#8A8A8A' }} />
            <div className="flex-1 relative min-w-0">
              {/* Hidden span for measuring text width */}
              <span
                ref={measureSpanRef}
                className="absolute invisible whitespace-pre"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  padding: 0,
                  margin: 0,
                  visibility: 'hidden',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />

              {/* "Task for" text - only shows when not focused */}
              {shouldShowLeadMention && leadName && !isFocused && (
                <span
                  className="absolute top-0 pointer-events-none"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6B7280',
                    left: `${inputTextWidth + 8}px`,
                    transition: 'opacity 0.15s ease-out',
                    whiteSpace: 'nowrap',
                    zIndex: 1,
                  }}
                >
                  For{' '}
                </span>
              )}

              {/* Lead mention tag (@leadName) - always visible, positioned dynamically after input text */}
              {shouldShowLeadMention && leadName && (
                <span
                  className="absolute top-0 pointer-events-none text-brand-primary"
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    left: `${leadMentionLeft}px`,
                    transition: 'left 0.1s ease-out',
                    whiteSpace: 'nowrap',
                    zIndex: 1,
                    maxWidth: `${maxWidthForMention}px`,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    // paddingLeft: '4px',
                  }}
                >
                  @{leadName}
                </span>
              )}
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                }}
                onFocus={(e) => {
                  setIsFocused(true)
                }}
                onBlur={(e) => {
                  setIsFocused(false)
                }}
                placeholder={shouldShowLeadMention && leadName ? '' : "Title"}
                className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 flex-1 relative"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  position: 'relative',
                  zIndex: 2,
                  minWidth: 0,
                  // Ensure input doesn't extend beyond lead mention position
                  ...(inputMaxWidth && { maxWidth: `${inputMaxWidth}px` }),
                  // Add padding-right to ensure text doesn't get cut off at the edge
                  paddingRight: shouldShowLeadMention && leadName && shouldConstrainInput ? '16px' : '0',
                  // Prevent text overflow into mention area
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                required
              />
            </div>
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
              onSelect={(option) => setPriority(option.value)}
              backgroundClassName="text-foreground"
              className="border-0 shadow-none h-[36px]"
              triggerClassName="hover:bg-black/[0.02]"
              contentClassName={elevatedZIndex ? 'z-[6100]' : undefined}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-3 mt-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description here..."
            className="min-h-[80px] resize-none"
            style={{ fontSize: '14px', lineHeight: '1.6' }}
            rows={3}
            required={isValidForm}
          />
        </div>

        {/* Action Row - Assignees, Due Date, Status (bottom right) */}
        <div className="flex items-center gap-2 flex-wrap mt-4">
          {/* Assignees - Use MultiSelectDropdownCn with visible borders */}
          <MultiSelectDropdownCn
            label="Assign"
            options={teamMemberOptions}
            onToggle={handleAssigneeToggle}
            contentClassName={elevatedZIndex ? 'z-[6100]' : undefined}
          />

          {/* Due Date */}
          <Popover
            open={datePickerOpen}
            onOpenChange={(open) => {
              if (!open && !isSavingDate) {
                // Save changes when closing if this is an edit form
                if (task && (dueDate?.getTime() !== (task.dueDate ? new Date(task.dueDate).getTime() : null) || dueTime !== (task.dueTime || ''))) {
                  // For edit mode, we'd need to call onSubmit, but since this is just the form,
                  // the parent will handle it when the form is submitted
                  // For now, just close
                }
              }
              setDatePickerOpen(open)
            }}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-2 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 h-[36px]"
                style={{ cursor: 'pointer' }}
                onMouseDown={(e) => {
                  // Stop propagation on mousedown to prevent TaskBoard handler from interfering
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  // Manually toggle if PopoverTrigger doesn't handle it
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
                  <TypographyBody className="text-muted-foreground pointer-events-none">
                    {dueDateDisplay || 'Due Date'}
                  </TypographyBody>
                )}
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1 pointer-events-none" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
              style={{ zIndex: elevatedZIndex ? 6100 : 1500 }}
              onInteractOutside={(e) => {
                // const taskBoard = document.querySelector('[data-task-board]')
                // // Check if clicking on the popover content itself
                // // const popoverContent = e.target.closest('[role="dialog"]')
                // // if (popoverContent) {
                // //   // Clicking inside popover - prevent closing
                // //   e.preventDefault()
                // //   return
                // // }

                // if (taskBoard && taskBoard.contains(e.target)) {
                //   // Clicking outside popover but inside task board - close popover
                //   // For create form, changes are already in state, so just close
                //   setDatePickerOpen(false)
                // } else {
                //   // Clicking outside task board - close popover
                //   setDatePickerOpen(false)
                // }
              }}
            >
              <div className="p-3 space-y-3 animate-in slide-in-from-bottom-2 duration-200 ease-out">
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

                {/* Time picker (brand-primary selected background) */}
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
                        style={{ zIndex: 6100 }}
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

          {/* Status - Bottom Right */}
          <div className="ml-auto">
            <DropdownCn
              label={
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[status] || '#9CA3AF' }}
                  />
                  <TypographyBodyMedium>{statusDisplayText[status] || status}</TypographyBodyMedium>
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
              onSelect={(option) => setStatus(option.value)}
              backgroundClassName="text-foreground"
              className="h-[36px]"
              contentClassName={elevatedZIndex ? 'z-[6100]' : undefined}
            />
          </div>
        </div>

        {/* Divider before action buttons */}
        {showButtons && (
          <div className={`border-t border-gray-200 mt-0 mb-4 ${hideBorder ? '-mx-0' : '-mx-4'} ${hideBorder ? 'px-0' : 'px-4'}`} />
        )}

        {/* Action buttons - Only show if showButtons is true */}
        {showButtons && (
          <div className="flex justify-end gap-2 pt-0 mt-0">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-primary text-white hover:bg-brand-primary/90">
              {task ? 'Update Task' : '+ Create New'}
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

export default TaskForm
