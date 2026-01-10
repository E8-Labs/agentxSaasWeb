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
import { toast } from 'sonner'
import { TypographyH3, TypographyBody } from '@/lib/typography'
import { cn } from '@/lib/utils'

const TaskBoard = ({ open, onClose, leadId = null, threadId = null, callId = null, buttonRef = null }) => {
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
      const response = await getTeamsList()
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
      const response = await createTask(taskData)
      if (response.status) {
        toast.success('Task created successfully')
        setIsCreating(false)
        setSelectedTask(null)
        fetchTasks() // Refresh list
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
      const response = await updateTask(taskId, updateData)
      if (response.status) {
        toast.success('Task updated successfully')
        setSelectedTask(null)
        fetchTasks() // Refresh list
      } else {
        toast.error(response.message || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await deleteTask(taskId)
      if (response.status) {
        toast.success('Task deleted successfully')
        fetchTasks() // Refresh list
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
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:253',message:'Click outside handler triggered',data:{targetTag:target.tagName,targetClass:target.className,hasTaskBoardRef:!!taskBoardRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v3',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:260',message:'Checking if inside task board',data:{isInsideTaskBoard,clickOriginatedInTaskBoard,shouldNotClose,pathLength:path.length,hasTaskBoardRef:!!taskBoardRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v5',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (shouldNotClose) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:268',message:'Click inside task board, not closing modal',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v5',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return
      }
      
      // Don't close if clicking the button that opened it
      if (buttonRef?.current && buttonRef.current.contains(target)) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:270',message:'Click on trigger button, ignoring',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v4',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return
      }

      // If clicking outside task board, check if any dropdowns are open
      // If dropdowns are open, don't close modal (let dropdown handle its own closing)
      const hasOpenDropdown = document.querySelector('[data-radix-dropdown-menu-content][data-state="open"]') ||
                              document.querySelector('[data-radix-popover-content][data-state="open"]') ||
                              document.querySelector('[role="menu"][data-state="open"]')
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:277',message:'Checking for open dropdowns (outside task board)',data:{hasOpenDropdown:!!hasOpenDropdown},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v4',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (hasOpenDropdown) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:281',message:'Open dropdown detected (outside), not closing modal',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v4',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:285',message:'Closing modal - click outside with no open dropdowns',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v4',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Close if clicking outside (on backdrop) and no dropdowns are open
      onClose()
    }

    // Use capture phase to catch events early, but with a small delay to let dropdowns handle their events first
    const timeoutId = setTimeout(() => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3b7a26ed-1403-42b9-8e39-cdb7b5ef3638',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TaskBoard.js:289',message:'Attaching click outside listener',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
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
          width: '552px',
          height: '771px',
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
            <ScrollArea className="flex-1 px-4 py-4">
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
            </ScrollArea>
          ) : (
            /* Task List */
            <ScrollArea className="flex-1 px-4 py-4 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading tasks...</div>
                </div>
              ) : filteredTasks.length === 0 ? (
                <TaskEmptyState />
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
            </ScrollArea>
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
                  + Create New
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
  )
}

export default TaskBoard
