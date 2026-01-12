'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTasks } from '@/components/onboarding/services/apisServices/TaskService'

/**
 * Hook to get task status indicators for the task icon
 * Returns: { hasActiveTasks: boolean, hasPastDueTasks: boolean }
 */
export const useTaskStatus = (leadId = null, threadId = null, callId = null) => {
  const [status, setStatus] = useState({ hasActiveTasks: false, hasPastDueTasks: false })
  const [isLoading, setIsLoading] = useState(false)

  const fetchTaskStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all tasks (not filtered by status) to check for active and past due
      const params = {}
      if (leadId) params.leadId = leadId
      if (threadId) params.threadId = threadId
      if (callId) params.callId = callId

      const response = await getTasks(params)
      
      if (response.status && response.data) {
        const tasks = response.data
        const now = new Date()
        now.setHours(0, 0, 0, 0)

        // Check for active tasks (todo or in-progress)
        const hasActiveTasks = tasks.some(
          (task) => task.status === 'todo' || task.status === 'in-progress'
        )

        // Check for past due tasks (any task with dueDate in the past and status not 'done')
        const hasPastDueTasks = tasks.some((task) => {
          if (!task.dueDate || task.status === 'done') return false
          const dueDate = new Date(task.dueDate)
          dueDate.setHours(0, 0, 0, 0)
          return dueDate < now
        })

        setStatus({ hasActiveTasks, hasPastDueTasks })
      }
    } catch (error) {
      console.error('Error fetching task status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [leadId, threadId, callId])

  useEffect(() => {
    fetchTaskStatus()
    
    // Listen for task changes from TaskBoard
    const handleTaskChange = () => {
      fetchTaskStatus()
    }
    window.addEventListener('tasksChanged', handleTaskChange)
    
    // Refresh every 30 seconds to keep status updated
    const interval = setInterval(fetchTaskStatus, 30000)
    
    return () => {
      window.removeEventListener('tasksChanged', handleTaskChange)
      clearInterval(interval)
    }
  }, [fetchTaskStatus])

  return { ...status, isLoading, refresh: fetchTaskStatus }
}
