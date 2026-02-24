'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { X, Sparkles } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import ToggleGroupCN from '@/components/ui/ToggleGroupCN'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import TaskEmptyState from './TaskEmptyState'
import TaskBoardFilterPopover from './TaskBoardFilterPopover'
import { getTasks, createTask, updateTask, deleteTask, pinTask, unpinTask } from '@/components/onboarding/services/apisServices/TaskService'
import { getTeamsList } from '@/components/onboarding/services/apisServices/ApiService'
import { toast } from '@/utils/toast'
import { TypographyH3, TypographyBody } from '@/lib/typography'
import { cn } from '@/lib/utils'
import DelConfirmationPopup from '../onboarding/extras/DelConfirmationPopup'
import { Box, CircularProgress, Modal } from '@mui/material'
import CloseBtn from '../globalExtras/CloseBtn'

const TaskBoard = ({ open, onClose, leadId = null, threadId = null, callId = null, buttonRef = null, selectedUser = null, enablePermissionChecks = false }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('todo')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [teamMembers, setTeamMembers] = useState([])
  const [counts, setCounts] = useState({ todo: 0, 'in-progress': 0, done: 0 })
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null)
  const taskBoardRef = useRef(null)

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  // Filter state: null = no filter / "All"
  const [filterMember, setFilterMember] = useState(null)
  const [filterDueStatus, setFilterDueStatus] = useState(null)
  const [filterPriority, setFilterPriority] = useState(null)

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

  useEffect(() => {
    console.log("LEad id passed in task board is", leadId)
    console.log("thread id passed in task board is", threadId)
  }, [leadId])

  // Calculate position: viewport-right when selectedUser (admin), else relative to button
  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const taskBoardHeight = selectedUser ? Math.round(viewportHeight * 0.75) : 771 // 75svh approx when selectedUser, else Figma

      let right
      let top

      if (selectedUser) {
        // Admin/selected-user view: align to viewport right with same padding as normal user view
        right = 20
        top = 20
      } else if (buttonRef?.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect()
        right = viewportWidth - buttonRect.right - 20
        top = buttonRect.top
      } else {
        return
      }

      // Ensure it doesn't go off screen
      if (right < 20) right = 20
      if (top + taskBoardHeight > viewportHeight) top = viewportHeight - taskBoardHeight - 20
      if (top < 20) top = 20

      setPosition({ top, right })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, buttonRef, selectedUser])

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!open) return

    setLoading(true)
    try {
      const params = {}
      // For regular status tabs, filter by status
      if (selectedStatus !== 'ai') {
        params.status = selectedStatus
      } else {
        // For AI tab, filter by task type created from call summaries
        params.type = 'ai_summary'
      }
      if (leadId) params.leadId = leadId
      if (threadId) params.threadId = threadId
      if (callId) params.callId = callId
      if (selectedUser?.id) params.userId = selectedUser.id
      if (filterMember != null && filterMember !== '') params.assignedTo = filterMember
      if (filterDueStatus) params.dueDateFilter = filterDueStatus
      if (filterPriority) params.priority = filterPriority
      console.log("Selected user passed is", selectedUser)
      console.log("params sending in api are", params)

      const response = await getTasks(params)
      console.log("response from get tasks is", response)
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
  }, [open, selectedStatus, leadId, threadId, callId, filterMember, filterDueStatus, filterPriority, selectedUser?.id])

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

  // Refetch when status or filters change
  useEffect(() => {
    if (open) fetchTasks()
  }, [open, selectedStatus, fetchTasks])

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

  // Handle pin / unpin: call API then move task to top locally
  const handlePinTask = async (taskId, pin) => {
    try {
      const api = pin ? pinTask : unpinTask
      const response = await api(taskId, selectedUser?.id)
      if (response.status) {
        setTasks((prev) => {
          const task = prev.find((t) => t.id === taskId)
          if (!task) return prev
          const updated = { ...task, isPinned: pin }
          const rest = prev.filter((t) => t.id !== taskId)
          if (pin) return [updated, ...rest]
          const pinned = rest.filter((t) => t.isPinned)
          const unpinned = rest.filter((t) => !t.isPinned)
          const newUnpinned = [...unpinned.filter((t) => t.id !== taskId), updated]
          return [...pinned, ...newUnpinned]
        })
        toast.success(pin ? 'Task pinned' : 'Task unpinned')
        window.dispatchEvent(new CustomEvent('tasksChanged'))
      } else {
        toast.error(response.message || (pin ? 'Failed to pin task' : 'Failed to unpin task'))
      }
    } catch (error) {
      console.error('Error pinning/unpinning task:', error)
      toast.error(pin ? 'Failed to pin task' : 'Failed to unpin task')
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true)
      const response = await deleteTask(taskId, selectedUser?.id)
      setShowDeleteConfirmation(false)
      setSelectedTaskForDelete(null)
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
    } finally {
      setLoading(false)
    }
  }

  // Status tabs configuration for ToggleGroupCN
  const statusTabs = [
    {
      label: (
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-brand-primary" />
          <span>AI</span>
        </div>
      ),
      value: 'ai',
    },
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

  // Filter tasks by selected status.
  // AI tab: only tasks with status 'ai'. Todo/In Progress/Done: all tasks with that status (including AI-origin tasks moved to that status).
  const filteredTasks =
    selectedStatus === 'ai'
      ? tasks.filter((task) => task.status === 'ai')
      : tasks.filter((task) => task.status === selectedStatus)

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setSelectedTask(null)
      setIsCreating(false)
      setSelectedStatus('todo')
      setFilterMember(null)
      setFilterDueStatus(null)
      setFilterPriority(null)
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

      // Don't close when clicking Agentation toolbar (allows annotating while task board is open)
      if (
        target?.closest?.('[data-feedback-toolbar]') ||
        target?.closest?.('[data-annotation-popup]') ||
        target?.closest?.('[data-annotation-marker]')
      ) {
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
          width: '35vw',
          height: selectedUser ? '80svh' : '95vh',
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

        {/* Status Tabs + Filter */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between w-full gap-2">
          <div className="flex min-w-0 ">
            <ToggleGroupCN
              options={statusTabs}
              value={selectedStatus}
              onChange={setSelectedStatus}
              height="p-1.5"
              roundedness="rounded-lg"
            />
          </div>
          <div className="z-9999">
            <TaskBoardFilterPopover
              filterMember={filterMember}
              setFilterMember={setFilterMember}
              filterDueStatus={filterDueStatus}
              setFilterDueStatus={setFilterDueStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              teamMembers={teamMembers}
            />
          </div>
        </div>

        {/* Content Area - constrain width so cards don't overflow */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 min-w-0">
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
            /* Task List - plain overflow container so width is strictly constrained (no horizontal scroll) */
            (<div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 min-w-0">
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
                  <div className="space-y-3" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                    {filteredTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={handleUpdateTask}
                        onDelete={() => {
                          setShowDeleteConfirmation(true)
                          setSelectedTaskForDelete(task)
                        }}
                        onPin={handlePinTask}
                        teamMembers={teamMembers}
                        priorityOptions={priorityOptions}
                        statusOptions={statusOptions}
                        onEditClick={() => {
                          setSelectedTask(task)
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>)
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
      {showDeleteConfirmation && (
        <Modal
          open={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false)
            setSelectedTaskForDelete(null)
          }}
          BackdropProps={{
            timeout: 200,
            sx: {
              backgroundColor: '#00000020',
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box
            className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
            sx={{ ...styles.modalsStyle, backgroundColor: 'white' }}
          >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '500', fontSize: 17 }}>
                  Delete Task
                </div>

              </div>
              <div style={{ fontWeight: '500', fontSize: 15 }}>
                Are you sure you want to delete this task?
              </div>
              <div style={{ display: 'flex', justifyContent: 'between', gap: 10, width: '100%' }}>
                <Button variant="outline-none" className="w-1/2 text-left text-[#6b7280]" onClick={() => setShowDeleteConfirmation(false)}>Cancel</Button>
                <Button className="bg-brand-primary text-white hover:bg-brand-primary/90 w-1/2" onClick={() => handleDeleteTask(selectedTaskForDelete.id)} disabled={loading}>
                  {loading ? "Deleting..." : 'Delete'}</Button>
              </div>
            </div>
          </Box>
        </Modal>
      )}
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

const styles = {
  modalsStyle: {
    height: 'auto',
    bgcolor: 'transparent',
    // p: 2,
    mx: 'auto',
    my: '50vh',
    transform: 'translateY(-55%)',
    borderRadius: 2,
    border: 'none',
    outline: 'none',
  },
}