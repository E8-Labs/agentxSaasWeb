'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Pin, Flag, ChevronDown, MoreVertical } from 'lucide-react'
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

const TaskForm = ({
  task = null,
  teamMembers = [],
  onSubmit,
  onCancel,
  leadId = null,
  threadId = null,
  callId = null,
  showButtons = true,
}) => {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [priority, setPriority] = useState(task?.priority || 'no-priority')
  const [status, setStatus] = useState(task?.status || 'todo')
  const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate) : null)
  const [dueTime, setDueTime] = useState(task?.dueTime || '')
  const [selectedAssignees, setSelectedAssignees] = useState(
    task?.assignedMembers?.map((m) => m.id) || [],
  )
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [isSavingDate, setIsSavingDate] = useState(false)

  // Priority options
  const priorityOptions = [
    { label: 'No Priority', value: 'no-priority', icon: Flag },
    { label: 'Low', value: 'low', icon: Flag },
    { label: 'Medium', value: 'medium', icon: Flag },
    { label: 'High', value: 'high', icon: Flag },
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

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-0" id="task-form">
        {/* Title with Pin and Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Pin className="h-4 w-4 flex-shrink-0" style={{ color: '#8A8A8A' }} />
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
              style={{ fontSize: '14px', fontWeight: 600 }}
              required
            />
          </div>
          {/* Priority and More Options - Top Right */}
          <div className="ml-2 flex items-center gap-2">
            <DropdownCn
              label={<TypographyCaption>{currentPriority.label}</TypographyCaption>}
              icon={Flag}
              options={priorityOptions.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              onSelect={(option) => setPriority(option.value)}
              backgroundClassName="text-foreground"
              className="border-0 shadow-none h-[36px]"
              iconColor="#8A8A8A"
            />
            {/* More Options - No border, no chevron */}
            <DropdownCn
              label=""
              icon={MoreVertical}
              options={moreOptions}
              backgroundClassName="text-foreground"
              className="border-0 shadow-none h-[36px]"
              hideChevron={true}
              iconColor="#8A8A8A"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-3 mt-2">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description here..."
            className="border-0 p-0 min-h-[60px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ fontSize: '14px' }}
            rows={3}
          />
        </div>

        {/* Action Row - Assignees, Due Date, Status (bottom right) */}
        <div className="flex items-center gap-2 flex-wrap mt-3">
          {/* Assignees - Use MultiSelectDropdownCn with visible borders */}
          <MultiSelectDropdownCn
            label="Assign"
            options={teamMemberOptions}
            onToggle={handleAssigneeToggle}
          />

          {/* Due Date */}
          <Popover open={datePickerOpen} onOpenChange={(open) => {
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
              style={{ zIndex: 200 }}
              onInteractOutside={(e) => {
                const taskBoard = document.querySelector('[data-task-board]')
                // Check if clicking on the popover content itself
                const popoverContent = e.target.closest('[role="dialog"]')
                if (popoverContent) {
                  // Clicking inside popover - prevent closing
                  e.preventDefault()
                  return
                }
                
                if (taskBoard && taskBoard.contains(e.target)) {
                  // Clicking outside popover but inside task board - close popover
                  // For create form, changes are already in state, so just close
                  setDatePickerOpen(false)
                } else {
                  // Clicking outside task board - close popover
                  setDatePickerOpen(false)
                }
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
            />
          </div>
        </div>

        {/* Action buttons - Only show if showButtons is true */}
        {showButtons && (
          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-200">
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
