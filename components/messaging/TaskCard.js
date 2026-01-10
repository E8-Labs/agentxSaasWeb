'use client'

import React from 'react'
import { CalendarIcon, Flag, MoreVertical, Pin } from 'lucide-react'
import moment from 'moment'
import DropdownCn from '@/components/dashboard/leads/extras/DropdownCn'
import MultiSelectDropdownCn from '@/components/dashboard/leads/extras/MultiSelectDropdownCn'
import { TypographyBody, TypographyBodySemibold, TypographyCaption, TypographyBodyMedium } from '@/lib/typography'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const TaskCard = ({
  task,
  onUpdate,
  onDelete,
  teamMembers = [],
  priorityOptions = [],
  statusOptions = [],
}) => {
  // Format due date
  const formatDueDate = () => {
    if (!task.dueDate) return null
    const dueDate = new Date(task.dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)

    if (dueDate < now && task.status !== 'done') {
      return { text: `Past Due: ${format(dueDate, 'MM/dd/yy')}`, isPastDue: true }
    }
    return { text: `Due on: ${format(dueDate, 'MM/dd/yy')}`, isPastDue: false }
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
        if (window.confirm('Are you sure you want to delete this task?')) {
          onDelete(task.id)
        }
      },
    },
  ]

  // Status color mapping
  const statusColors = {
    todo: 'bg-purple-500',
    'in-progress': 'bg-orange-500',
    done: 'bg-green-500',
  }

  // Get current priority option
  const currentPriority = priorityOptions.find((p) => p.value === task.priority) || priorityOptions[0]
  
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

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Title with Pin and Priority */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Pin className="h-4 w-4 flex-shrink-0" style={{ color: '#8A8A8A' }} />
          <TypographyBodySemibold className="text-foreground">
            {task.title}
          </TypographyBodySemibold>
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
              onSelect={handlePriorityChange}
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
      {task.description && (
        <div className="mb-3 mt-2">
          <TypographyBody className="text-muted-foreground">
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
      <div className="flex items-center gap-2 flex-wrap mt-3">
        {/* Assignees - Use MultiSelectDropdownCn with visible borders */}
        <MultiSelectDropdownCn
          label="Assign"
          options={teamMemberOptions}
          onToggle={handleAssigneeToggle}
        />

        {/* Due Date */}
        {dueDateInfo ? (
          <div className="flex items-center gap-1 px-2 py-2 rounded-lg border border-gray-300 bg-white h-[36px]">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <TypographyBody
              className={cn(
                dueDateInfo.isPastDue ? 'text-red-500 font-semibold' : 'text-muted-foreground',
              )}
            >
              {dueDateInfo.text}
            </TypographyBody>
          </div>
        ) : (
          <div className="flex items-center gap-1 px-2 py-2 rounded-lg border border-gray-300 bg-white h-[36px]">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <TypographyBody className="text-muted-foreground">
              Due Date
            </TypographyBody>
          </div>
        )}

        {/* Status - Bottom Right */}
        <div className="ml-auto">
          <DropdownCn
            label={
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', statusColors[task.status] || 'bg-gray-400')} />
                <TypographyBodyMedium>{statusDisplayText[task.status] || task.status}</TypographyBodyMedium>
              </div>
            }
            options={statusOptions.map((opt) => ({
              label: typeof opt.label === 'string' ? opt.label : opt.value,
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
