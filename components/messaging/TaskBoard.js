'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Filter, X, ChevronUp } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import ToggleGroupCN from '@/components/ui/ToggleGroupCN'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import TaskEmptyState from './TaskEmptyState'
import { getTasks, createTask, updateTask, deleteTask } from '@/components/onboarding/services/apisServices/TaskService'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import { toast } from '@/utils/toast'
import { TypographyH3, TypographyBody } from '@/lib/typography'
import { cn } from '@/lib/utils'

const TaskBoard = ({ open, onClose, leadId = null, threadId = null, callId = null, buttonRef = null, selectedUser = null }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('todo')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [counts, setCounts] = useState({ todo: 0, 'in-progress': 0, done: 0 })
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const taskBoardRef = useRef(null)

  // Priority options for dropdowns
  const priorityOptions = [
    { label: 'No Priority', value: 'no-priority', icon: null },
    { label: 'Low', value: 'low', icon: null },
    { label: 'Medium', value: 'medium', icon: null },
    { label: 'High', value: 'high', icon: null },
  ]

  // Status options for dropdowns
  const statusOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Done', value: 'done' },
  ]

  // Calculate position relative to button
  useEffect(() => {
    if (open && buttonRef?.current) {
      const updatePosition = () => {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const taskBoardWidth = 552 // From Figma
        const taskBoardHeight = 771 // From Figma
        
        // Position to the right of the button, aligned to top
        let right = viewportWidth - buttonRect.right - 20 // 20px offset from button
        let top = buttonRect.top
        
        // Ensure it doesn't go off screen
        if (right < 20) {
          right = 20
        }
        if (top + taskBoardHeight > viewportHeight) {
          top = viewportHeight - taskBoardHeight - 20
        }
        if (top < 20) {
          top = 20
        }
        
        setPosition({ top, right })
      }

      updatePosition()
      
      // Update on scroll/resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [open, buttonRef])

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!open) return

    setLoading(true)
    try {
      const params = {
        status: selectedStatus,
      }
      if (leadId) params.leadId = leadId
      if (threadId) params.threadId = threadId
      if (callId) params.callId = callId
      if (selectedUser?.id) params.userId = selectedUser.id

      const response = await getTasks(params)
      if (response.status) {
        setTasks(response.data || [])
        if (response.counts) {
          setCounts(response.counts)
        }
      } else {
        toast.error(response.message || 'Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [open, selectedStatus, leadId, threadId, callId])

  // Fetch team members
  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await getTeamsList(selectedUser?.id)
      if (response) {
        const members = []
        // Add admin
        if (response.admin) {
          members.push({
            id: response.admin.id,
            name: response.admin.name,
            email: response.admin.email,
            thumb_profile_image: response.admin.thumb_profile_image,
          })
        }
        // Add team members
        if (response.data && Array.isArray(response.data)) {
          response.data.forEach((team) => {
            if (team.status === 'Accepted' && team.invitedUser) {
              members.push({
                id: team.invitedUser.id,
                name: team.invitedUser.name,
                email: team.invitedUser.email,
                thumb_profile_image: team.invitedUser.thumb_profile_image,
                invitedUserId: team.invitedUser.id,
                invitedUser: team.invitedUser,
              })
            }
          })
        }
        setTeamMembers(members)
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    }
  }, [])

  // Load data when component opens
  useEffect(() => {
    if (open) {
      fetchTasks()
      fetchTeamMembers()
    }
  }, [open, fetchTasks, fetchTeamMembers])

  // Refetch when status changes
  useEffect(() => {
    if (open) {
      fetchTasks()
    }
  }, [selectedStatus, fetchTasks])

  // Handle task creation
  const handleCreateTask = async (taskData) => {
    try {
      const response = await createTask(taskData, selectedUser?.id)
      if (response.status) {
        toast.success('Task created successfully')
        setIsCreating(false)
        setSelectedTask(null)
        fetchTasks() // Refresh list
        // Notify that tasks have changed
        window.dispatchEvent(new CustomEvent('tasksChanged'))
      } else {
        toast.error(response.message || 'Failed to create task')
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  // Handle task update
  const handleUpdateTask = async (taskId, updateData) => {
    try {
      // Optimistically update the local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...updateData,
                // Handle assignedMembers if assignedTo is provided
                ...(updateData.assignedTo && {
                  assignedMembers: updateData.assignedTo.map((memberId) => {
                    const member = teamMembers.find(
                      (m) => (m.invitedUserId || m.invitedUser?.id || m.id) === memberId
                    )
                    return member
                      ? {
                          id: memberId,
                          name: member.name || member.invitedUser?.name || 'Unknown',
                          thumb_profile_image: member.thumb_profile_image || member.invitedUser?.thumb_profile_image,
                        }
                      : { id: memberId }
                  }),
                }),
              }
            : task
        )
      )

      // Update counts locally if status changed
      if (updateData.status) {
        const oldTask = tasks.find((t) => t.id === taskId)
        if (oldTask) {
          setCounts((prev) => {
            const newCounts = { ...prev }
            // Decrement old status
            if (oldTask.status && newCounts[oldTask.status] > 0) {
              newCounts[oldTask.status]--
            }
            // Increment new status
            if (newCounts[updateData.status] !== undefined) {
              newCounts[updateData.status]++
            }
            return newCounts
          })
        }
      }

      const response = await updateTask(taskId, updateData, selectedUser?.id)
      if (response.status) {
        // Update with server response if different
        if (response.data) {
          setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === taskId ? { ...task, ...response.data } : task))
          )
        }
        toast.success('Task updated successfully')
        setSelectedTask(null)
        // Notify that tasks have changed
        window.dispatchEvent(new CustomEvent('tasksChanged'))
      } else {
        // Revert on error
        fetchTasks()
        toast.error(response.message || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert on error
      fetchTasks()
      toast.error('Failed to update task')
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await deleteTask(taskId, selectedUser?.id)
      if (response.status) {
        toast.success('Task deleted successfully')
        fetchTasks() // Refresh list
        // Notify that tasks have changed
        window.dispatchEvent(new CustomEvent('tasksChanged'))
      } else {
        toast.error(response.message || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  // Status tabs configuration for ToggleGroupCN
  const statusTabs = [
    {
      label: 'To Dos',
      value: 'todo',
      count: counts.todo || 0,
    },
    {
      label: 'In Progress',
      value: 'in-progress',
      count: counts['in-progress'] || 0,
    },
    {
      label: 'Done',
      value: 'done',
      count: counts.done || 0,
    },
  ]

  // Filter tasks by selected status
  const filteredTasks = tasks.filter((task) => task.status === selectedStatus)

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setSelectedTask(null)
      setIsCreating(false)
      setSelectedStatus('todo')
      setTasks([])
    }
  }, [open])

  // Close on outside click - but not when clicking inside form or dropdowns
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      const target = event.target
      
      // CRITICAL FIX: Check if click originated from inside task board using composed path
      // This catches clicks on dropdown triggers/content even if they're in portals
      const path = event.composedPath && event.composedPath() || []
      const clickOriginatedInTaskBoard = path.some((node) => {
        if (!node || !taskBoardRef.current) return false
        // Check if this node or any of its parents is inside the task board
        return taskBoardRef.current.contains(node)
      })
      // Also check direct target containment (for non-portal elements)
      const isInsideTaskBoard = taskBoardRef.current && taskBoardRef.current.contains(target)
      const shouldNotClose = clickOriginatedInTaskBoard || isInsideTaskBoard
      if (shouldNotClose) {
        return
      }
      
      // Don't close if clicking the button that opened it
      if (buttonRef?.current && buttonRef.current.contains(target)) {
        return
      }

      // If clicking outside task board, check if any dropdowns are open
      // If dropdowns are open, don't close modal (let dropdown handle its own closing)
      const hasOpenDropdown = document.querySelector('[data-radix-dropdown-menu-content][data-state="open"]') ||
                              document.querySelector('[data-radix-popover-content][data-state="open"]') ||
                              document.querySelector('[role="menu"][data-state="open"]')
      if (hasOpenDropdown) {
        return
      }

      // Close if clicking outside (on backdrop) and no dropdowns are open
      onClose()
    }

    // Use capture phase to catch events early, but with a small delay to let dropdowns handle their events first
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true)
    }, 50)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }, [open, onClose, buttonRef])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[100] backdrop"
        style={{
          animation: 'fadeIn 0.2s ease-out',
        }}
      />
      {/* Task Board Modal */}
      <div
        ref={taskBoardRef}
        data-task-board
        className="fixed bg-white rounded-xl shadow-[0px_8px_24.4px_0px_rgba(0,0,0,0.10)] z-[101] flex flex-col overflow-hidden"
        style={{
          width: '38vw',
          height: '95vh',
          top: `${position.top}px`,
          right: `${position.right}px`,
          animation: 'slideInFromButton 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
          <TypographyH3 className="text-lg font-semibold text-foreground">Task Board</TypographyH3>
          <div className="flex items-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="px-4 py-3 border-b border-gray-200 flex">
          <ToggleGroupCN
            options={statusTabs}
            value={selectedStatus}
            onChange={setSelectedStatus}
            height="p-1.5"
            roundedness="rounded-lg"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {isCreating || selectedTask ? (
            /* Task Form */
            (<ScrollArea className="flex-1 px-4 py-4">
              <TaskForm
                task={selectedTask}
                teamMembers={teamMembers}
                onSubmit={selectedTask ? (data) => handleUpdateTask(selectedTask.id, data) : handleCreateTask}
                onCancel={() => {
                  setIsCreating(false)
                  setSelectedTask(null)
                }}
                leadId={leadId}
                threadId={threadId}
                callId={callId}
                showButtons={false}
              />
            </ScrollArea>)
          ) : (
            /* Task List */
            (<ScrollArea className="flex-1 px-4 py-4 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading tasks...</div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <TaskEmptyState 
                  title={selectedStatus === 'todo' ? 'No Task Created' : 'No Task Found'}
                  description={selectedStatus === 'todo' ? undefined : null}
                />
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                      teamMembers={teamMembers}
                      priorityOptions={priorityOptions}
                      statusOptions={statusOptions}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>)
          )}

          {/* Action Buttons - Always visible in footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex-shrink-0 flex justify-end gap-2">
            {isCreating || selectedTask ? (
              <>
                <Button variant="outline" onClick={() => {
                  setIsCreating(false)
                  setSelectedTask(null)
                }}>
                  Cancel
                </Button>
                <Button
                  className="bg-brand-primary text-white hover:bg-brand-primary/90"
                  onClick={() => {
                    const form = document.querySelector('form')
                    if (form) {
                      form.requestSubmit()
                    }
                  }}
                >
                  {selectedTask ? 'Update Task' : '+ Create New'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  className="bg-brand-primary text-white hover:bg-brand-primary/90"
                  onClick={() => setIsCreating(true)}
                >
                  + New Task
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInFromButton {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}

export default TaskBoard
